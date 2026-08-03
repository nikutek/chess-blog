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

export function parseSideline(branchFen: string, pgn: string): ParsedMove[] {
  const chess = new Chess();
  chess.loadPgn(`[SetUp "1"]\n[FEN "${branchFen}"]\n\n${pgn}`);

  return chess.history({ verbose: true }).map((move) => ({
    san: move.san,
    fen: move.after,
  }));
}
