import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.fn();
const redirect = vi.fn();
const fetchMock = vi.fn();
const createGameRecord = vi.fn();
const publishGameRecord = vi.fn();
const unpublishGameRecord = vi.fn();
const createAnnotationRecord = vi.fn();
const updateAnnotationTextRecord = vi.fn();
const deleteAnnotationRecord = vi.fn();

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
vi.stubGlobal("fetch", fetchMock);

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
  fetchMock.mockReset();
  revalidatePath.mockReset();
  createGameRecord.mockReset();
  publishGameRecord.mockReset();
  unpublishGameRecord.mockReset();
  createAnnotationRecord.mockReset();
  updateAnnotationTextRecord.mockReset();
  deleteAnnotationRecord.mockReset();
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

    expect(createAnnotationRecord).toHaveBeenCalledWith(1, "startpos", "Solid opening choice.");
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
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
  it("posts a new sideline when no sidelineId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

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

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/games/1/sidelines"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
        body: JSON.stringify({
          branchFen: "startpos",
          pgn: "2. Nc3 Nf6",
          description: "A quieter alternative to Nf3.",
        }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("includes the parentSidelineId when creating a nested sideline", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

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

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/games/1/sidelines"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ branchFen: "startpos", pgn: "1... Nf6", description: "", parentSidelineId: 3 }),
      }),
    );
  });

  it("puts to the sideline's own url when a sidelineId is given", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "7", branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "" }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/games/1/sidelines/7"),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
        body: JSON.stringify({ pgn: "2. Nc3 Nf6", description: "" }),
      }),
    );
  });

  it("rejects a blank pgn without calling the backend", async () => {
    const result = await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "", branchFen: "startpos", pgn: "", description: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await saveSideline(
      undefined,
      formData({ gameId: "1", sidelineId: "", branchFen: "startpos", pgn: "2. Nc3 Nf6", description: "" }),
    );

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns an error message when the backend rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

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
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await deleteSideline(undefined, formData({ gameId: "1", sidelineId: "7" }));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/games/1/sidelines/7"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/games/1");
    expect(result).toBeUndefined();
  });

  it("returns an error message when the backend rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

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
