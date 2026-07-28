import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.fn();
const redirect = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ getAccessToken }));
vi.mock("next/navigation", () => ({ redirect }));
vi.stubGlobal("fetch", fetchMock);

const { createGame } = await import("./actions");

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
  color: "WHITE",
  opponent: "Kasparov",
  date: "2026-08-02",
};

beforeEach(() => {
  getAccessToken.mockReset();
  redirect.mockReset();
  fetchMock.mockReset();
});

describe("createGame", () => {
  it("rejects empty fields without calling the backend", async () => {
    const result = await createGame(
      undefined,
      formData({ tournamentId: "", pgn: "", color: "", opponent: "", date: "" }),
    );

    expect(result?.error).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await createGame(undefined, formData(validFields));

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to the backend with a bearer token and redirects to the tournament's game list", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

    await createGame(undefined, formData(validFields));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/games"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
        body: JSON.stringify({
          tournamentId: 1,
          pgn: "1. e4 e5 2. Nf3 Nc6",
          color: "WHITE",
          opponent: "Kasparov",
          date: "2026-08-02",
        }),
      }),
    );
    expect(redirect).toHaveBeenCalledWith("/tournaments/1/games");
  });

  it("returns an error message when the backend rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    const result = await createGame(undefined, formData(validFields));

    expect(result?.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
