import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

const { listTournaments, createTournament } = await import("./tournaments");

beforeEach(() => {
  from.mockReset();
});

describe("listTournaments", () => {
  it("returns tournaments from the tournament table", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: "City Open", location: "Warsaw", date: "2026-08-01" }],
      error: null,
    });
    const select = vi.fn(() => ({ order }));
    from.mockReturnValue({ select });

    const result = await listTournaments();

    expect(from).toHaveBeenCalledWith("tournament");
    expect(select).toHaveBeenCalledWith("id, name, location, date:tournament_date");
    expect(result).toEqual([{ id: 1, name: "City Open", location: "Warsaw", date: "2026-08-01" }]);
  });

  it("throws when Supabase returns an error", async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: "boom" } });
    const select = vi.fn(() => ({ order }));
    from.mockReturnValue({ select });

    await expect(listTournaments()).rejects.toThrow("Could not load tournaments.");
  });
});

describe("createTournament", () => {
  it("inserts a tournament and returns the created row", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 2, name: "City Open", location: "Warsaw", date: "2026-08-01" },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    const result = await createTournament("City Open", "Warsaw", "2026-08-01");

    expect(from).toHaveBeenCalledWith("tournament");
    expect(insert).toHaveBeenCalledWith({
      name: "City Open",
      location: "Warsaw",
      tournament_date: "2026-08-01",
    });
    expect(result).toEqual({ id: 2, name: "City Open", location: "Warsaw", date: "2026-08-01" });
  });

  it("throws when Supabase rejects the insert (e.g. anonymous write blocked by RLS)", async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "new row violates row-level security policy" },
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    from.mockReturnValue({ insert });

    await expect(createTournament("City Open", "Warsaw", "2026-08-01")).rejects.toThrow(
      "Could not create the tournament.",
    );
  });
});
