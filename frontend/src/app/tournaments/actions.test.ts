import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccessToken = vi.fn();
const redirect = vi.fn();
const createTournamentRecord = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ getAccessToken }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/tournaments", () => ({ createTournament: createTournamentRecord }));

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
  createTournamentRecord.mockReset();
});

describe("createTournament", () => {
  it("rejects empty fields without calling Supabase", async () => {
    const result = await createTournament(undefined, formData({ name: "", location: "", date: "" }));

    expect(result?.error).toBeTruthy();
    expect(createTournamentRecord).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no access token", async () => {
    getAccessToken.mockResolvedValue(undefined);

    await createTournament(undefined, formData(validFields));

    expect(redirect).toHaveBeenCalledWith("/login");
    expect(createTournamentRecord).not.toHaveBeenCalled();
  });

  it("creates the tournament and redirects on success", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createTournamentRecord.mockResolvedValue({
      id: 1,
      name: "City Open",
      location: "Warsaw",
      date: "2026-08-01",
    });

    await createTournament(undefined, formData(validFields));

    expect(createTournamentRecord).toHaveBeenCalledWith("City Open", "Warsaw", "2026-08-01");
    expect(redirect).toHaveBeenCalledWith("/tournaments");
  });

  it("returns an error message when Supabase rejects the request", async () => {
    getAccessToken.mockResolvedValue("test-access-token");
    createTournamentRecord.mockRejectedValue(new Error("Could not create the tournament."));

    const result = await createTournament(undefined, formData(validFields));

    expect(result?.error).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
