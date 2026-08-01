import { describe, expect, it } from "vitest";

import { parsePgn } from "./parse-pgn";

describe("parsePgn", () => {
  it("returns one entry per move with its SAN and resulting FEN", () => {
    const moves = parsePgn("1. e4 e5");

    expect(moves).toHaveLength(2);
    expect(moves[0].san).toBe("e4");
    expect(moves[0].fen).toBe(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    );
    expect(moves[1].san).toBe("e5");
  });

  it("parses a PGN with tag-pair headers", () => {
    const pgn = '[Event "City Open"]\n[Site "Warsaw"]\n\n1. e4 e5 2. Nf3 Nc6';

    const moves = parsePgn(pgn);

    expect(moves.map((move) => move.san)).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });
});
