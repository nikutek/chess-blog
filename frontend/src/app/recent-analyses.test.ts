import { describe, expect, it } from "vitest";

import { toRecentAnalyses } from "./recent-analyses";

describe("toRecentAnalyses", () => {
  it("maps a game to a title, tag, opening description and board moves", () => {
    const [analysis] = toRecentAnalyses([
      {
        id: 1,
        pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
        opponent: "Kasparov",
        tournament: { name: "City Open" },
      },
    ]);

    expect(analysis).toEqual({
      id: 1,
      title: "vs Kasparov",
      tag: "City Open",
      desc: "e4 e5 Nf3",
      moves: [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "g1", to: "f3" },
      ],
    });
  });

  it("only takes the opening's first three plies even for longer games", () => {
    const [analysis] = toRecentAnalyses([
      {
        id: 2,
        pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5",
        opponent: "Karpov",
        tournament: { name: "Winter Cup" },
      },
    ]);

    expect(analysis.moves).toHaveLength(3);
    expect(analysis.desc).toBe("d4 d5 c4");
  });

  it("returns an empty list for no games", () => {
    expect(toRecentAnalyses([])).toEqual([]);
  });
});
