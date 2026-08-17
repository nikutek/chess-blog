import { Chess } from "chess.js";

export type Game = {
  id: number;
  pgn: string;
  opponent: string;
  tournament: { name: string };
};

export type SquareMove = { from: string; to: string };

export type RecentAnalysis = {
  id: number;
  title: string;
  tag: string;
  desc: string;
  moves: SquareMove[];
};

const OPENING_PLY_COUNT = 3;

export function toRecentAnalyses(games: Game[]): RecentAnalysis[] {
  return games.map((game) => {
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    const openingMoves = chess.history({ verbose: true }).slice(0, OPENING_PLY_COUNT);

    return {
      id: game.id,
      title: `vs ${game.opponent}`,
      tag: game.tournament.name,
      desc: openingMoves.map((move) => move.san).join(" "),
      moves: openingMoves.map((move) => ({ from: move.from, to: move.to })),
    };
  });
}
