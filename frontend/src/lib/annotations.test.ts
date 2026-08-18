import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

const { createAnnotation, listAnnotationsByGame, updateAnnotationText, deleteAnnotation } =
  await import("./annotations");

beforeEach(() => {
  from.mockReset();
});

const ANNOTATION_ROW = {
  id: 5,
  gameId: 1,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  text: "Solid opening choice.",
};

describe("createAnnotation", () => {
  it("inserts a main-line annotation and returns the created row", async () => {
    const single = vi.fn().mockResolvedValue({ data: ANNOTATION_ROW, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    const result = await createAnnotation(1, ANNOTATION_ROW.fen, "Solid opening choice.");

    expect(from).toHaveBeenCalledWith("annotation");
    expect(insert).toHaveBeenCalledWith({
      game_id: 1,
      context_type: "main_line",
      fen: ANNOTATION_ROW.fen,
      text: "Solid opening choice.",
    });
    expect(result).toEqual(ANNOTATION_ROW);
  });

  it("throws when Supabase rejects the insert (e.g. blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    await expect(createAnnotation(1, ANNOTATION_ROW.fen, "text")).rejects.toThrow(
      "Could not save the annotation.",
    );
  });
});

describe("listAnnotationsByGame", () => {
  it("returns the annotations for a game", async () => {
    const eq = vi.fn().mockResolvedValue({ data: [ANNOTATION_ROW], error: null });
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    const result = await listAnnotationsByGame(1);

    expect(from).toHaveBeenCalledWith("annotation");
    expect(eq).toHaveBeenCalledWith("game_id", 1);
    expect(result).toEqual([ANNOTATION_ROW]);
  });

  it("throws when Supabase returns an error", async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ eq }));
    from.mockReturnValue({ select });

    await expect(listAnnotationsByGame(1)).rejects.toThrow("Could not load the annotations.");
  });
});

describe("updateAnnotationText", () => {
  it("updates the annotation's text and returns the updated row", async () => {
    const updatedRow = { ...ANNOTATION_ROW, text: "updated" };
    const single = vi.fn().mockResolvedValue({ data: updatedRow, error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    const result = await updateAnnotationText(5, "updated");

    expect(from).toHaveBeenCalledWith("annotation");
    expect(update).toHaveBeenCalledWith({ text: "updated" });
    expect(eq).toHaveBeenCalledWith("id", 5);
    expect(result).toEqual(updatedRow);
  });

  it("throws when Supabase rejects the update (e.g. blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    from.mockReturnValue({ update });

    await expect(updateAnnotationText(5, "updated")).rejects.toThrow(
      "Could not save the annotation.",
    );
  });
});

describe("deleteAnnotation", () => {
  it("deletes the annotation by id", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    from.mockReturnValue({ delete: del });

    await deleteAnnotation(5);

    expect(from).toHaveBeenCalledWith("annotation");
    expect(eq).toHaveBeenCalledWith("id", 5);
  });

  it("throws when Supabase rejects the delete (e.g. blocked by RLS)", async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    const del = vi.fn(() => ({ eq }));
    from.mockReturnValue({ delete: del });

    await expect(deleteAnnotation(5)).rejects.toThrow("Could not delete the annotation.");
  });
});
