import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.fn();
const redirect = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ getAccessToken }));
vi.mock("next/navigation", () => ({ redirect }));
vi.stubGlobal("fetch", fetchMock);

const { createTournament } = await import("./actions");

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const validFields = { name: "City Open", location: "Warsaw", date: "2026-08-01" };

beforeEach(() => {
  getAccessToken.mockReset();
  redirect.mockReset();
  fetchMock.mockReset();
});

describe("createTournament", () => {
  it("rejects empty fields without calling the backend", async () => {
    const result = await createTournament(undefined, formData({ name: "", location: "", date: "" }));

    expect(result?.error).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await createTournament(undefined, formData(validFields));

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to the backend with a bearer token and redirects on success", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));

    await createTournament(undefined, formData(validFields));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/tournaments"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-access-token" }),
      }),
    );
    expect(redirect).toHaveBeenCalledWith("/tournaments");
  });

  it("returns an error message when the backend rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    const result = await createTournament(undefined, formData(validFields));

    expect(result?.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
