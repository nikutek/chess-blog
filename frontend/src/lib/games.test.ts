import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

const {
  createGame,
  getGame,
  publishGame,
  unpublishGame,
  listGamesByTournament,
  listRecentPublishedGames,
} = await import("./games");

beforeEach(() => {
  from.mockReset();
});

const GAME_ROW = {
  id: 1,
  tournamentId: 2,
  pgn: "1. e4 e5 2. Nf3 Nc6",
  color: "white",
  status: "draft",
  opponent: "Kasparov",
  date: "2026-08-02",
};

describe("createGame", () => {
  it("inserts a game and returns the created row", async () => {
    const single = vi.fn().mockResolvedValue({ data: GAME_ROW, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    const result = await createGame(2, "1. e4 e5 2. Nf3 Nc6", "white", "Kasparov", "2026-08-02");

    expect(from).toHaveBeenCalledWith("game");
    expect(insert).toHaveBeenCalledWith({
      tournament_id: 2,
      pgn: "1. e4 e5 2. Nf3 Nc6",
      color: "white",
      opponent: "Kasparov",
      game_date: "2026-08-02",
    });
    expect(result).toEqual(GAME_ROW);
  });

  it("rejects a structurally invalid PGN without calling Supabase", async () => {
    await expect(
      createGame(2, "not a pgn", "white", "Kasparov", "2026-08-02"),
    ).rejects.toThrow(/pgn/i);

    expect(from).not.toHaveBeenCalled();
  });

  it("throws when Supabase rejects the insert", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    await expect(
      createGame(2, "1. e4 e5 2. Nf3 Nc6", "white", "Kasparov", "2026-08-02"),
    ).rejects.toThrow("Could not import the game.");
  });
});

describe("getGame", () => {
  it("returns the game by id", async () => {
    const single = vi.fn().mockResolvedValue({ data: GAME_ROW, error: null });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    const result = await getGame(1);

    expect(from).toHaveBeenCalledWith("game");
    expect(eq).toHaveBeenCalledWith("id", 1);
    expect(result).toEqual(GAME_ROW);
  });

  it("throws when the game is not visible (missing, or a Draft hidden by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    await expect(getGame(1)).rejects.toThrow("Could not load the game.");
  });
});

describe("publishGame", () => {
  it("sets the game's status to published", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...GAME_ROW, status: "published" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    const result = await publishGame(1);

    expect(update).toHaveBeenCalledWith({ status: "published" });
    expect(eq).toHaveBeenCalledWith("id", 1);
    expect(result.status).toBe("published");
  });

  it("throws when Supabase rejects the update (e.g. blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    await expect(publishGame(1)).rejects.toThrow("Could not publish the game.");
  });
});

describe("unpublishGame", () => {
  it("sets the game's status to draft", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...GAME_ROW, status: "draft" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    const result = await unpublishGame(1);

    expect(update).toHaveBeenCalledWith({ status: "draft" });
    expect(result.status).toBe("draft");
  });

  it("throws when Supabase rejects the update", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    await expect(unpublishGame(1)).rejects.toThrow("Could not unpublish the game.");
  });
});

describe("listGamesByTournament", () => {
  it("returns games for a tournament, ordered most recent first", async () => {
    const order = vi.fn().mockResolvedValue({ data: [GAME_ROW], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    const result = await listGamesByTournament(2);

    expect(from).toHaveBeenCalledWith("game");
    expect(eq).toHaveBeenCalledWith("tournament_id", 2);
    expect(order).toHaveBeenCalledWith("game_date", { ascending: false });
    expect(result).toEqual([GAME_ROW]);
  });

  it("throws when Supabase returns an error", async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    await expect(listGamesByTournament(2)).rejects.toThrow("Could not load games.");
  });
});

describe("listRecentPublishedGames", () => {
  it("returns the most recent published games with their tournament name", async () => {
    const recentRow = {
      id: 1,
      pgn: "1. e4 e5 2. Nf3 Nc6",
      opponent: "Kasparov",
      tournament: { name: "City Open" },
    };
    const limit = vi.fn().mockResolvedValue({ data: [recentRow], error: null });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    const result = await listRecentPublishedGames(4);

    expect(from).toHaveBeenCalledWith("game");
    expect(eq).toHaveBeenCalledWith("status", "published");
    expect(order).toHaveBeenCalledWith("game_date", { ascending: false });
    expect(limit).toHaveBeenCalledWith(4);
    expect(result).toEqual([recentRow]);
  });

  it("throws when Supabase returns an error", async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const order = vi.fn(() => ({ limit }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    await expect(listRecentPublishedGames(4)).rejects.toThrow("Could not load recent games.");
  });
});
