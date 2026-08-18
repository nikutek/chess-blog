// Structural check only: does this look like a PGN move sequence (starts
// with a move number followed by a move), once any leading tag-pair header
// lines (e.g. `[Event "..."]`, as produced by every real PGN export) are
// skipped? Chess legality is never validated here -- chess.js does that
// client-side (see ADR-0003).

const TAG_PAIR_LINE = /^\[[^\]]*]$/;
const STARTS_WITH_MOVE = /^1\.\s*\S+/;

export function isValidPgn(pgn: string): boolean {
  if (!pgn) return false;
  return STARTS_WITH_MOVE.test(movetext(pgn));
}

function movetext(pgn: string): string {
  const lines = pgn.trim().split(/\r\n|\r|\n/);
  let firstMovetextLine = 0;
  while (
    firstMovetextLine < lines.length &&
    (lines[firstMovetextLine].trim() === "" ||
      TAG_PAIR_LINE.test(lines[firstMovetextLine].trim()))
  ) {
    firstMovetextLine++;
  }
  return lines.slice(firstMovetextLine).join("\n").trim();
}
