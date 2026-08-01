import { Chess } from "chess.js";

export type ParsedMove = {
  san: string;
  fen: string;
};

export function parsePgn(pgn: string): ParsedMove[] {
  const chess = new Chess();
  chess.loadPgn(pgn);

  return chess.history({ verbose: true }).map((move) => ({
    san: move.san,
    fen: move.after,
  }));
}
