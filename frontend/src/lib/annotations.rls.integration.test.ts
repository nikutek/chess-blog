// Real-database RLS test: proves the Draft/Published Annotation visibility
// split (following the parent Game's status) and the admin-only
// insert/update/delete restriction live in Postgres policies
// (supabase/migrations/*_create_annotation.sql), not in application code.
// Requires a local Supabase instance:
//
//   supabase start
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
//     SUPABASE_SERVICE_ROLE_KEY=... npm run test:integration
//
// (the URL and both keys are printed by `supabase start`.) Skips itself,
// with a warning, when the local stack isn't reachable -- it never runs as
// part of `npm test`.
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function isReachable(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

const canRun =
  !!SUPABASE_URL && !!ANON_KEY && !!SERVICE_ROLE_KEY && (await isReachable(SUPABASE_URL));

if (!canRun) {
  console.warn(
    "Skipping annotation RLS integration tests: run `supabase start` and set " +
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and " +
      "SUPABASE_SERVICE_ROLE_KEY (all printed by `supabase start`) to run them.",
  );
}

describe.skipIf(!canRun)("annotation RLS policies", () => {
  const serviceClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const adminEmail = `rls-test-${Date.now()}@example.com`;
  const adminPassword = "correct-horse-battery-staple-42";

  let anonClient: ReturnType<typeof createClient>;
  let adminClient: ReturnType<typeof createClient>;
  let tournamentId: number;
  let draftGameId: number;
  let publishedGameId: number;
  let draftAnnotationId: number;
  let publishedAnnotationId: number;

  beforeAll(async () => {
    const { data: tournament, error: tournamentError } = await serviceClient
      .from("tournament")
      .insert({ name: "RLS Test Tournament", location: "Test City", tournament_date: "2026-01-01" })
      .select("id")
      .single();
    if (tournamentError) throw tournamentError;
    tournamentId = tournament.id;

    const { data: draftGame, error: draftError } = await serviceClient
      .from("game")
      .insert({
        tournament_id: tournamentId,
        pgn: "1. e4 e5",
        color: "white",
        status: "draft",
        opponent: "Draft Opponent",
        game_date: "2026-01-01",
      })
      .select("id")
      .single();
    if (draftError) throw draftError;
    draftGameId = draftGame.id;

    const { data: publishedGame, error: publishedError } = await serviceClient
      .from("game")
      .insert({
        tournament_id: tournamentId,
        pgn: "1. d4 d5",
        color: "black",
        status: "published",
        opponent: "Published Opponent",
        game_date: "2026-01-01",
      })
      .select("id")
      .single();
    if (publishedError) throw publishedError;
    publishedGameId = publishedGame.id;

    const { data: draftAnnotation, error: draftAnnotationError } = await serviceClient
      .from("annotation")
      .insert({ game_id: draftGameId, context_type: "main_line", fen: "startpos", text: "Draft note" })
      .select("id")
      .single();
    if (draftAnnotationError) throw draftAnnotationError;
    draftAnnotationId = draftAnnotation.id;

    const { data: publishedAnnotation, error: publishedAnnotationError } = await serviceClient
      .from("annotation")
      .insert({ game_id: publishedGameId, context_type: "main_line", fen: "startpos", text: "Published note" })
      .select("id")
      .single();
    if (publishedAnnotationError) throw publishedAnnotationError;
    publishedAnnotationId = publishedAnnotation.id;

    const { error: createUserError } = await serviceClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    if (createUserError) throw createUserError;

    anonClient = createClient(SUPABASE_URL!, ANON_KEY!);
    adminClient = createClient(SUPABASE_URL!, ANON_KEY!);
    const { error: signInError } = await adminClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (signInError) throw signInError;
  }, 30_000);

  afterAll(async () => {
    await serviceClient.from("annotation").delete().eq("game_id", draftGameId);
    await serviceClient.from("annotation").delete().eq("game_id", publishedGameId);
    await serviceClient.from("game").delete().eq("tournament_id", tournamentId);
    await serviceClient.from("tournament").delete().eq("id", tournamentId);
    const { data: users } = await serviceClient.auth.admin.listUsers();
    const testUser = users?.users.find((user) => user.email === adminEmail);
    if (testUser) await serviceClient.auth.admin.deleteUser(testUser.id);
  });

  describe("select", () => {
    it("hides an Annotation belonging to a Draft game from an anonymous caller", async () => {
      const { data } = await anonClient.from("annotation").select("id").eq("id", draftAnnotationId);
      expect(data).toEqual([]);
    });

    it("shows an Annotation belonging to a Published game to an anonymous caller", async () => {
      const { data } = await anonClient
        .from("annotation")
        .select("id")
        .eq("id", publishedAnnotationId);
      expect(data).toHaveLength(1);
    });

    it("shows Annotations on both Draft and Published games to the authenticated admin", async () => {
      const { data: draft } = await adminClient
        .from("annotation")
        .select("id")
        .eq("id", draftAnnotationId);
      const { data: published } = await adminClient
        .from("annotation")
        .select("id")
        .eq("id", publishedAnnotationId);

      expect(draft).toHaveLength(1);
      expect(published).toHaveLength(1);
    });
  });

  describe("insert", () => {
    it("blocks an anonymous caller from creating an annotation", async () => {
      const { error } = await anonClient.from("annotation").insert({
        game_id: publishedGameId,
        context_type: "main_line",
        fen: "anon-insert",
        text: "Nobody's note",
      });

      expect(error).not.toBeNull();
    });

    it("allows the authenticated admin to create an annotation", async () => {
      const { data, error } = await adminClient
        .from("annotation")
        .insert({ game_id: publishedGameId, context_type: "main_line", fen: "admin-insert", text: "Admin note" })
        .select("id")
        .single();

      expect(error).toBeNull();
      await serviceClient.from("annotation").delete().eq("id", data!.id);
    });
  });

  describe("update", () => {
    it("blocks an anonymous caller from editing an annotation's text", async () => {
      const { data } = await anonClient
        .from("annotation")
        .update({ text: "hacked" })
        .eq("id", publishedAnnotationId)
        .select("id");
      expect(data).toEqual([]);

      const { data: unchanged } = await serviceClient
        .from("annotation")
        .select("text")
        .eq("id", publishedAnnotationId)
        .single();
      expect(unchanged!.text).toBe("Published note");
    });

    it("allows the authenticated admin to edit an annotation's text", async () => {
      const { data } = await adminClient
        .from("annotation")
        .update({ text: "Updated published note" })
        .eq("id", publishedAnnotationId)
        .select("text")
        .single();
      expect(data!.text).toBe("Updated published note");

      await serviceClient
        .from("annotation")
        .update({ text: "Published note" })
        .eq("id", publishedAnnotationId);
    });
  });

  describe("delete", () => {
    it("blocks an anonymous caller from deleting an annotation", async () => {
      const { data } = await anonClient
        .from("annotation")
        .delete()
        .eq("id", publishedAnnotationId)
        .select("id");
      expect(data).toEqual([]);

      const { data: stillThere } = await serviceClient
        .from("annotation")
        .select("id")
        .eq("id", publishedAnnotationId);
      expect(stillThere).toHaveLength(1);
    });

    it("allows the authenticated admin to delete an annotation", async () => {
      const { data: created } = await serviceClient
        .from("annotation")
        .insert({ game_id: publishedGameId, context_type: "main_line", fen: "admin-delete", text: "To delete" })
        .select("id")
        .single();

      const { error } = await adminClient.from("annotation").delete().eq("id", created!.id);
      expect(error).toBeNull();

      const { data: gone } = await serviceClient.from("annotation").select("id").eq("id", created!.id);
      expect(gone).toEqual([]);
    });
  });
});
