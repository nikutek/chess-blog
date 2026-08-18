// Real-database RLS test: proves the anonymous-vs-admin Game visibility
// split lives in Postgres policies (supabase/migrations/*_create_game.sql),
// not in application code. Requires a local Supabase instance:
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
    "Skipping game RLS integration tests: run `supabase start` and set " +
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and " +
      "SUPABASE_SERVICE_ROLE_KEY (all printed by `supabase start`) to run them.",
  );
}

describe.skipIf(!canRun)("game RLS policies", () => {
  const serviceClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  const adminEmail = `rls-test-${Date.now()}@example.com`;
  const adminPassword = "correct-horse-battery-staple-42";

  let anonClient: ReturnType<typeof createClient>;
  let adminClient: ReturnType<typeof createClient>;
  let tournamentId: number;
  let draftGameId: number;
  let publishedGameId: number;

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
    await serviceClient.from("game").delete().eq("tournament_id", tournamentId);
    await serviceClient.from("tournament").delete().eq("id", tournamentId);
    const { data: users } = await serviceClient.auth.admin.listUsers();
    const testUser = users?.users.find((user) => user.email === adminEmail);
    if (testUser) await serviceClient.auth.admin.deleteUser(testUser.id);
  });

  describe("select", () => {
    it("hides a Draft game from an anonymous caller", async () => {
      const { data } = await anonClient.from("game").select("id").eq("id", draftGameId);
      expect(data).toEqual([]);
    });

    it("shows a Published game to an anonymous caller", async () => {
      const { data } = await anonClient.from("game").select("id").eq("id", publishedGameId);
      expect(data).toHaveLength(1);
    });

    it("shows both Draft and Published games to the authenticated admin", async () => {
      const { data: draft } = await adminClient.from("game").select("id").eq("id", draftGameId);
      const { data: published } = await adminClient
        .from("game")
        .select("id")
        .eq("id", publishedGameId);

      expect(draft).toHaveLength(1);
      expect(published).toHaveLength(1);
    });
  });

  describe("insert", () => {
    it("blocks an anonymous caller from importing a game", async () => {
      const { error } = await anonClient.from("game").insert({
        tournament_id: tournamentId,
        pgn: "1. e4",
        color: "white",
        opponent: "Nobody",
        game_date: "2026-01-01",
      });

      expect(error).not.toBeNull();
    });

    it("allows the authenticated admin to import a game", async () => {
      const { data, error } = await adminClient
        .from("game")
        .insert({
          tournament_id: tournamentId,
          pgn: "1. e4",
          color: "white",
          opponent: "Insert Test",
          game_date: "2026-01-01",
        })
        .select("id")
        .single();

      expect(error).toBeNull();
      await serviceClient.from("game").delete().eq("id", data!.id);
    });
  });

  describe("update (publish/unpublish)", () => {
    it("blocks an anonymous caller from publishing a game", async () => {
      const { data } = await anonClient
        .from("game")
        .update({ status: "published" })
        .eq("id", draftGameId)
        .select("id");
      expect(data).toEqual([]);

      const { data: unchanged } = await serviceClient
        .from("game")
        .select("status")
        .eq("id", draftGameId)
        .single();
      expect(unchanged!.status).toBe("draft");
    });

    it("allows the authenticated admin to publish and unpublish a game", async () => {
      const { data: published } = await adminClient
        .from("game")
        .update({ status: "published" })
        .eq("id", draftGameId)
        .select("status")
        .single();
      expect(published!.status).toBe("published");

      const { data: unpublished } = await adminClient
        .from("game")
        .update({ status: "draft" })
        .eq("id", draftGameId)
        .select("status")
        .single();
      expect(unpublished!.status).toBe("draft");
    });
  });
});
