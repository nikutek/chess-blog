const TAG_PAIR_LINE = /^\[[^\]]*]$/;
const STARTS_WITH_MOVE = /^1\.\s*\S+/;

export function isValidPgn(pgn: string): boolean {
  return !!pgn && STARTS_WITH_MOVE.test(movetext(pgn));
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
