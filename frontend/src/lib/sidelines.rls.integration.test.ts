// Real-database RLS + cascade test: proves the Draft/Published Sideline
// visibility split (following the parent Game's status), the admin-only
// insert/update/delete restriction, and the cascading delete of nested
// Sidelines and their Annotations, all live in Postgres (see
// supabase/migrations/20260818030000_create_sideline.sql), not application
// code. Requires a local Supabase instance:
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
    "Skipping sideline RLS integration tests: run `supabase start` and set " +
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and " +
      "SUPABASE_SERVICE_ROLE_KEY (all printed by `supabase start`) to run them.",
  );
}

describe.skipIf(!canRun)("sideline RLS policies and cascading delete", () => {
  const serviceClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const adminEmail = `rls-test-${Date.now()}@example.com`;
  const adminPassword = "correct-horse-battery-staple-42";

  let anonClient: ReturnType<typeof createClient>;
  let adminClient: ReturnType<typeof createClient>;
  let tournamentId: number;
  let draftGameId: number;
  let publishedGameId: number;
  let draftSidelineId: number;
  let publishedSidelineId: number;

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

    const { data: draftSideline, error: draftSidelineError } = await serviceClient
      .from("sideline")
      .insert({ game_id: draftGameId, branch_fen: "startpos", pgn: "1... c5", description: "Draft sideline" })
      .select("id")
      .single();
    if (draftSidelineError) throw draftSidelineError;
    draftSidelineId = draftSideline.id;

    const { data: publishedSideline, error: publishedSidelineError } = await serviceClient
      .from("sideline")
      .insert({ game_id: publishedGameId, branch_fen: "startpos", pgn: "1... Nf6", description: "Published sideline" })
      .select("id")
      .single();
    if (publishedSidelineError) throw publishedSidelineError;
    publishedSidelineId = publishedSideline.id;

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
    await serviceClient.from("sideline").delete().eq("game_id", draftGameId);
    await serviceClient.from("sideline").delete().eq("game_id", publishedGameId);
    await serviceClient.from("game").delete().eq("tournament_id", tournamentId);
    await serviceClient.from("tournament").delete().eq("id", tournamentId);
    const { data: users } = await serviceClient.auth.admin.listUsers();
    const testUser = users?.users.find((user) => user.email === adminEmail);
    if (testUser) await serviceClient.auth.admin.deleteUser(testUser.id);
  });

  describe("select", () => {
    it("hides a Sideline belonging to a Draft game from an anonymous caller", async () => {
      const { data } = await anonClient.from("sideline").select("id").eq("id", draftSidelineId);
      expect(data).toEqual([]);
    });

    it("shows a Sideline belonging to a Published game to an anonymous caller", async () => {
      const { data } = await anonClient.from("sideline").select("id").eq("id", publishedSidelineId);
      expect(data).toHaveLength(1);
    });

    it("shows Sidelines on both Draft and Published games to the authenticated admin", async () => {
      const { data: draft } = await adminClient.from("sideline").select("id").eq("id", draftSidelineId);
      const { data: published } = await adminClient
        .from("sideline")
        .select("id")
        .eq("id", publishedSidelineId);

      expect(draft).toHaveLength(1);
      expect(published).toHaveLength(1);
    });
  });

  describe("insert", () => {
    it("blocks an anonymous caller from creating a sideline", async () => {
      const { error } = await anonClient.from("sideline").insert({
        game_id: publishedGameId,
        branch_fen: "startpos",
        pgn: "1... e5",
        description: "Nobody's sideline",
      });

      expect(error).not.toBeNull();
    });

    it("allows the authenticated admin to create a sideline, including one nested under another", async () => {
      const { data: parent, error: parentError } = await adminClient
        .from("sideline")
        .insert({ game_id: publishedGameId, branch_fen: "startpos", pgn: "1... e5", description: "" })
        .select("id")
        .single();
      expect(parentError).toBeNull();

      const { data: child, error: childError } = await adminClient
        .from("sideline")
        .insert({
          game_id: publishedGameId,
          parent_sideline_id: parent!.id,
          branch_fen: "startpos",
          pgn: "2. Nf3 Nc6",
          description: "",
        })
        .select("id")
        .single();
      expect(childError).toBeNull();

      await serviceClient.from("sideline").delete().eq("id", child!.id);
      await serviceClient.from("sideline").delete().eq("id", parent!.id);
    });
  });

  describe("update", () => {
    it("blocks an anonymous caller from editing a sideline", async () => {
      const { data } = await anonClient
        .from("sideline")
        .update({ pgn: "hacked" })
        .eq("id", publishedSidelineId)
        .select("id");
      expect(data).toEqual([]);
    });

    it("allows the authenticated admin to edit a sideline", async () => {
      const { data } = await adminClient
        .from("sideline")
        .update({ pgn: "1... Nf6 2. c4" })
        .eq("id", publishedSidelineId)
        .select("pgn")
        .single();
      expect(data!.pgn).toBe("1... Nf6 2. c4");

      await serviceClient.from("sideline").update({ pgn: "1... Nf6" }).eq("id", publishedSidelineId);
    });
  });

  describe("delete", () => {
    it("blocks an anonymous caller from deleting a sideline", async () => {
      const { data } = await anonClient.from("sideline").delete().eq("id", publishedSidelineId).select("id");
      expect(data).toEqual([]);
    });

    it("cascades: deleting a Sideline removes its nested descendant Sidelines and all their Annotations", async () => {
      const { data: root } = await serviceClient
        .from("sideline")
        .insert({ game_id: publishedGameId, branch_fen: "startpos", pgn: "1... c5", description: "root" })
        .select("id")
        .single();
      const rootId = root!.id;

      const { data: child } = await serviceClient
        .from("sideline")
        .insert({
          game_id: publishedGameId,
          parent_sideline_id: rootId,
          branch_fen: "startpos",
          pgn: "2. Nf3 d6",
          description: "child",
        })
        .select("id")
        .single();
      const childId = child!.id;

      const { data: grandchild } = await serviceClient
        .from("sideline")
        .insert({
          game_id: publishedGameId,
          parent_sideline_id: childId,
          branch_fen: "startpos",
          pgn: "3. d4 cxd4",
          description: "grandchild",
        })
        .select("id")
        .single();
      const grandchildId = grandchild!.id;

      const { data: rootAnnotation } = await serviceClient
        .from("annotation")
        .insert({ game_id: publishedGameId, context_type: "sideline", sideline_id: rootId, fen: "root-fen", text: "root note" })
        .select("id")
        .single();
      const { data: grandchildAnnotation } = await serviceClient
        .from("annotation")
        .insert({
          game_id: publishedGameId,
          context_type: "sideline",
          sideline_id: grandchildId,
          fen: "grandchild-fen",
          text: "grandchild note",
        })
        .select("id")
        .single();

      const { error: deleteError } = await adminClient.from("sideline").delete().eq("id", rootId);
      expect(deleteError).toBeNull();

      const { data: remainingSidelines } = await serviceClient
        .from("sideline")
        .select("id")
        .in("id", [rootId, childId, grandchildId]);
      expect(remainingSidelines).toEqual([]);

      const { data: remainingAnnotations } = await serviceClient
        .from("annotation")
        .select("id")
        .in("id", [rootAnnotation!.id, grandchildAnnotation!.id]);
      expect(remainingAnnotations).toEqual([]);
    });

    it("allows the authenticated admin to delete a leaf sideline", async () => {
      const { data: created } = await serviceClient
        .from("sideline")
        .insert({ game_id: publishedGameId, branch_fen: "startpos", pgn: "1... a6", description: "" })
        .select("id")
        .single();

      const { error } = await adminClient.from("sideline").delete().eq("id", created!.id);
      expect(error).toBeNull();

      const { data: gone } = await serviceClient.from("sideline").select("id").eq("id", created!.id);
      expect(gone).toEqual([]);
    });
  });
});
