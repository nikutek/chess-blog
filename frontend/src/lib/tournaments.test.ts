import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();
const createClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({ createClient }));

const { listTournaments, createTournament } = await import("./tournaments");

function queryResult(result: { data: unknown; error: { message: string } | null }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void, reject: (reason: unknown) => void) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return builder;
}

beforeEach(() => {
  from.mockReset();
  createClient.mockReset();
  createClient.mockResolvedValue({ from });
});

describe("listTournaments", () => {
  it("returns tournaments read from the tournament table", async () => {
    const rows = [{ id: 1, name: "City Open", location: "Warsaw", date: "2026-08-01" }];
    from.mockReturnValue(queryResult({ data: rows, error: null }));

    const result = await listTournaments();

    expect(from).toHaveBeenCalledWith("tournament");
    expect(result).toEqual(rows);
  });

  it("throws when the query fails", async () => {
    from.mockReturnValue(queryResult({ data: null, error: { message: "boom" } }));

    await expect(listTournaments()).rejects.toThrow();
  });
});

describe("createTournament", () => {
  it("inserts a tournament row and returns it", async () => {
    const row = { id: 2, name: "City Open", location: "Warsaw", date: "2026-08-01" };
    const builder = queryResult({ data: row, error: null });
    from.mockReturnValue(builder);

    const result = await createTournament("City Open", "Warsaw", "2026-08-01");

    expect(from).toHaveBeenCalledWith("tournament");
    expect(builder.insert).toHaveBeenCalledWith({
      name: "City Open",
      location: "Warsaw",
      tournament_date: "2026-08-01",
    });
    expect(result).toEqual(row);
  });

  it("throws when the insert fails", async () => {
    from.mockReturnValue(queryResult({ data: null, error: { message: "boom" } }));

    await expect(createTournament("City Open", "Warsaw", "2026-08-01")).rejects.toThrow();
  });
});
