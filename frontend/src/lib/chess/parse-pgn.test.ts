import { describe, expect, it } from "vitest";

import { parsePgn, parseSideline } from "./parse-pgn";

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

describe("parseSideline", () => {
  it("plays the snippet out from the given branch position", () => {
    const branchFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

    const moves = parseSideline(branchFen, "2. Nc3 Nf6");

    expect(moves.map((move) => move.san)).toEqual(["Nc3", "Nf6"]);
    expect(moves[0].fen).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2",
    );
  });
});
