import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.fn();
const redirect = vi.fn();
const createGameRecord = vi.fn();
const publishGameRecord = vi.fn();
const unpublishGameRecord = vi.fn();
const createAnnotationRecord = vi.fn();
const updateAnnotationTextRecord = vi.fn();
const deleteAnnotationRecord = vi.fn();
const createSidelineRecord = vi.fn();
const updateSidelineRecord = vi.fn();
const deleteSidelineRecord = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ getAccessToken }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/games", () => ({
  createGame: createGameRecord,
  publishGame: publishGameRecord,
  unpublishGame: unpublishGameRecord,
}));
vi.mock("@/lib/annotations", () => ({
  createAnnotation: createAnnotationRecord,
  updateAnnotationText: updateAnnotationTextRecord,
  deleteAnnotation: deleteAnnotationRecord,
}));
vi.mock("@/lib/sidelines", () => ({
  createSideline: createSidelineRecord,
  updateSideline: updateSidelineRecord,
  deleteSideline: deleteSidelineRecord,
}));

const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));

const {
  createGame,
  publishGame,
  unpublishGame,
  saveAnnotation,
  deleteAnnotation,
  saveSideline,
  deleteSideline,
} = await import("./actions");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const validFields = {
  tournamentId: "1",
  pgn: "1. e4 e5 2. Nf3 Nc6",
  color: "white",
  opponent: "Kasparov",
  date: "2026-08-02",
};

beforeEach(() => {
  getAccessToken.mockReset();
  redirect.mockReset();
  revalidatePath.mockReset();
  createGameRecord.mockReset();
  publishGameRecord.mockReset();
  unpublishGameRecord.mockReset();
  createAnnotationRecord.mockReset();
  updateAnnotationTextRecord.mockReset();
  deleteAnnotationRecord.mockReset();
  createSidelineRecord.mockReset();
  updateSidelineRecord.mockReset();
  deleteSidelineRecord.mockReset();
});

describe("createGame", () => {
  it("rejects empty fields without calling Supabase", async () => {
    const result = await createGame(
      undefined,
      formData({ tournamentId: "", pgn: "", color: "", opponent: "", date: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(createGameRecord).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await createGame(undefined, formData(validFields));

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(createGameRecord).not.toHaveBeenCalled();
  });

  it("creates the game and redirects to the tournament's game list", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createGameRecord.mockResolvedValue({ id: 1, tournamentId: 1 });

    await createGame(undefined, formData(validFields));

    expect(createGameRecord).toHaveBeenCalledWith(
      1,
      "1. e4 e5 2. Nf3 Nc6",
      "white",
      "Kasparov",
      "2026-08-02",
    );
    expect(redirect).toHaveBeenCalledWith("/tournaments/1/games");
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createGameRecord.mockRejectedValue(new Error("Could not import the game."));

    const result = await createGame(undefined, formData(validFields));

    expect(result?.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("publishGame", () => {
  it("publishes the game and revalidates the game page", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    publishGameRecord.mockResolvedValue({ id: 1, status: "published" });

    const result = await publishGame(undefined, formData({ gameId: "1" }));

    expect(publishGameRecord).toHaveBeenCalledWith(1);
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    publishGameRecord.mockRejectedValue(new Error("boom"));

    const result = await publishGame(undefined, formData({ gameId: "1" }));

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("unpublishGame", () => {
  it("unpublishes the game and revalidates the game page", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    unpublishGameRecord.mockResolvedValue({ id: 1, status: "draft" });

    const result = await unpublishGame(undefined, formData({ gameId: "1" }));

    expect(unpublishGameRecord).toHaveBeenCalledWith(1);
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    unpublishGameRecord.mockRejectedValue(new Error("boom"));

    const result = await unpublishGame(undefined, formData({ gameId: "1" }));

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("saveAnnotation", () => {
  it("creates a new annotation when no annotationId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createAnnotationRecord.mockResolvedValue({ id: 1, gameId: 1, fen: "startpos", text: "Solid opening choice." });

    const result = await saveAnnotation(
      undefined,
      formData({ gameId: "1", fen: "startpos", annotationId: "", text: "Solid opening choice." }),
    );

    expect(createAnnotationRecord).toHaveBeenCalledWith(1, "startpos", "Solid opening choice.", undefined);
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("creates a sideline-context annotation when a sidelineId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createAnnotationRecord.mockResolvedValue({
      id: 2,
      gameId: 1,
      fen: "startpos",
      text: "Transposes to the main line.",
      contextType: "SIDELINE",
      sidelineId: 7,
    });

    await saveAnnotation(
      undefined,
      formData({
        gameId: "1",
        fen: "startpos",
        annotationId: "",
        text: "Transposes to the main line.",
        sidelineId: "7",
      }),
    );

    expect(createAnnotationRecord).toHaveBeenCalledWith(1, "startpos", "Transposes to the main line.", 7);
  });

  it("updates the annotation's text when an annotationId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    updateAnnotationTextRecord.mockResolvedValue({ id: 5, gameId: 1, fen: "startpos", text: "updated" });

    await saveAnnotation(
      undefined,
      formData({ gameId: "1", fen: "startpos", annotationId: "5", text: "updated" }),
    );

    expect(updateAnnotationTextRecord).toHaveBeenCalledWith(5, "updated");
    expect(createAnnotationRecord).not.toHaveBeenCalled();
  });

  it("rejects blank text without calling Supabase", async () => {
    const result = await saveAnnotation(
      undefined,
      formData({ gameId: "1", fen: "startpos", annotationId: "", text: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(createAnnotationRecord).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await saveAnnotation(
      undefined,
      formData({ gameId: "1", fen: "startpos", annotationId: "", text: "text" }),
    );

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(createAnnotationRecord).not.toHaveBeenCalled();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createAnnotationRecord.mockRejectedValue(new Error("boom"));

    const result = await saveAnnotation(
      undefined,
      formData({ gameId: "1", fen: "startpos", annotationId: "", text: "text" }),
    );

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("saveSideline", () => {
  it("creates a new top-level sideline when no sidelineId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createSidelineRecord.mockResolvedValue({
      id: 7,
      gameId: 1,
      parentSidelineId: null,
      branchFen: "startpos",
      pgn: "2. Nc3 Nf6",
      description: "A quieter alternative to Nf3.",
    });

    const result = await saveSideline(
      undefined,
      formData({
        gameId: "1",
        sidelineId: "",
        branchFen: "startpos",
        pgn: "2. Nc3 Nf6",
        description: "A quieter alternative to Nf3.",
      }),
    );

    expect(createSidelineRecord).toHaveBeenCalledWith(
      1,
      null,
      "startpos",
      "2. Nc3 Nf6",
      "A quieter alternative to Nf3.",
    );
    expect(updateSidelineRecord).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("includes the parentSidelineId when creating a nested sideline", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createSidelineRecord.mockResolvedValue({
      id: 8,
      gameId: 1,
      parentSidelineId: 3,
      branchFen: "startpos",
      pgn: "1... Nf6",
      description: "",
    });

    await saveSideline(
      undefined,
      formData({
        gameId: "1",
        sidelineId: "",
        parentSidelineId: "3",
        branchFen: "startpos",
        pgn: "1... Nf6",
        description: "",
      }),
    );

    expect(createSidelineRecord).toHaveBeenCalledWith(1, 3, "startpos", "1... Nf6", "");
  });

  it("updates the existing sideline when a sidelineId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    updateSidelineRecord.mockResolvedValue({
      id: 7,
      gameId: 1,
      parentSidelineId: null,
      branchFen: "startpos",
      pgn: "2. Nc3 Nf6",
      description: "",
    });

    await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "7", branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "" }),
    );

    expect(updateSidelineRecord).toHaveBeenCalledWith(7, "2. Nc3 Nf6", "");
    expect(createSidelineRecord).not.toHaveBeenCalled();
  });

  it("rejects a blank pgn without calling lib/sidelines", async () => {
    const result = await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "", branchFen: "startpos", pgn: "", description: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(createSidelineRecord).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "", branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "" }),
    );

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(createSidelineRecord).not.toHaveBeenCalled();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createSidelineRecord.mockRejectedValue(new Error("boom"));

    const result = await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "", branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteSideline", () => {
  it("deletes the sideline and revalidates the game page", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    deleteSidelineRecord.mockResolvedValue(undefined);

    const result = await deleteSideline(undefined, formData({ gameId: "1", sidelineId: "7" }));

    expect(deleteSidelineRecord).toHaveBeenCalledWith(7);
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    deleteSidelineRecord.mockRejectedValue(new Error("boom"));

    const result = await deleteSideline(undefined, formData({ gameId: "1", sidelineId: "7" }));

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteAnnotation", () => {
  it("deletes the annotation and revalidates the game page", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    deleteAnnotationRecord.mockResolvedValue(undefined);

    const result = await deleteAnnotation(undefined, formData({ gameId: "1", annotationId: "5" }));

    expect(deleteAnnotationRecord).toHaveBeenCalledWith(5);
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await deleteAnnotation(undefined, formData({ gameId: "1", annotationId: "5" }));

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(deleteAnnotationRecord).not.toHaveBeenCalled();
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    deleteAnnotationRecord.mockRejectedValue(new Error("boom"));

    const result = await deleteAnnotation(undefined, formData({ gameId: "1", annotationId: "5" }));

    expect(result?.error).toBeTruthy();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
