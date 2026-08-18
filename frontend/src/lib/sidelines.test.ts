import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

const { createSideline, listSidelinesByGame, updateSideline, deleteSideline } =
  await import("./sidelines");

beforeEach(() => {
  from.mockReset();
});

const SIDELINE_ROW = {
  id: 7,
  gameId: 1,
  parentSidelineId: null,
  branchFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  pgn: "2. Nc3 Nf6",
  description: "A quieter alternative to Nf3.",
};

describe("createSideline", () => {
  it("inserts a top-level sideline and returns the created row", async () => {
    const single = vi.fn().mockResolvedValue({ data: SIDELINE_ROW, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    const result = await createSideline(1, null, SIDELINE_ROW.branchFen, "2. Nc3 Nf6", "A quieter alternative to Nf3.");

    expect(from).toHaveBeenCalledWith("sideline");
    expect(insert).toHaveBeenCalledWith({
      game_id: 1,
      parent_sideline_id: null,
      branch_fen: SIDELINE_ROW.branchFen,
      pgn: "2. Nc3 Nf6",
      description: "A quieter alternative to Nf3.",
    });
    expect(result).toEqual(SIDELINE_ROW);
  });

  it("inserts a nested sideline with its parentSidelineId", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...SIDELINE_ROW, id: 8, parentSidelineId: 7 },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    await createSideline(1, 7, SIDELINE_ROW.branchFen, "1... Nf6", "");

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ parent_sideline_id: 7 }),
    );
  });

  it("throws when Supabase rejects the insert (e.g. blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    await expect(
      createSideline(1, null, SIDELINE_ROW.branchFen, "2. Nc3 Nf6", ""),
    ).rejects.toThrow("Could not save the sideline.");
  });
});

describe("listSidelinesByGame", () => {
  it("returns the sidelines for a game", async () => {
    const eq = vi.fn().mockResolvedValue({ data: [SIDELINE_ROW], error: null });
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    const result = await listSidelinesByGame(1);

    expect(from).toHaveBeenCalledWith("sideline");
    expect(eq).toHaveBeenCalledWith("game_id", 1);
    expect(result).toEqual([SIDELINE_ROW]);
  });

  it("throws when Supabase returns an error", async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    await expect(listSidelinesByGame(1)).rejects.toThrow("Could not load the sidelines.");
  });
});

describe("updateSideline", () => {
  it("updates the sideline's pgn and description and returns the updated row", async () => {
    const updatedRow = { ...SIDELINE_ROW, pgn: "2. Nc3 Nf6 3. Bb5", description: "updated" };
    const single = vi.fn().mockResolvedValue({ data: updatedRow, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    const result = await updateSideline(7, "2. Nc3 Nf6 3. Bb5", "updated");

    expect(from).toHaveBeenCalledWith("sideline");
    expect(update).toHaveBeenCalledWith({ pgn: "2. Nc3 Nf6 3. Bb5", description: "updated" });
    expect(eq).toHaveBeenCalledWith("id", 7);
    expect(result).toEqual(updatedRow);
  });

  it("throws when Supabase rejects the update (e.g. blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    await expect(updateSideline(7, "2. Nc3", "")).rejects.toThrow("Could not save the sideline.");
  });
});

describe("deleteSideline", () => {
  it("deletes the sideline by id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    from.mockReturnValue({ delete: del });

    await deleteSideline(7);

    expect(from).toHaveBeenCalledWith("sideline");
    expect(eq).toHaveBeenCalledWith("id", 7);
  });

  it("throws when Supabase rejects the delete (e.g. blocked by RLS)", async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    const del = vi.fn(() => ({ eq }));
    from.mockReturnValue({ delete: del });

    await expect(deleteSideline(7)).rejects.toThrow("Could not delete the sideline.");
  });
});
