package com.chessdiary.backend.game;

import java.util.regex.Pattern;

// Structural check only: does this look like a PGN move sequence (starts with
// a move number followed by a move), once any leading tag-pair header lines
// (e.g. "[Event \"...\"]", as produced by every real PGN export) are skipped?
// Chess legality is never validated here -- chess.js does that client-side
// (see ADR-0003).
final class PgnFormat {

	private static final Pattern TAG_PAIR_LINE = Pattern.compile("^\\[[^\\]]*]$");
	private static final Pattern STARTS_WITH_MOVE = Pattern.compile("^1\\.\\s*\\S+");

	private PgnFormat() {
	}

	static boolean isValid(String pgn) {
		return pgn != null && STARTS_WITH_MOVE.matcher(movetext(pgn)).find();
	}

	private static String movetext(String pgn) {
		String[] lines = pgn.trim().split("\\R");
		int firstMovetextLine = 0;
		while (firstMovetextLine < lines.length
				&& (lines[firstMovetextLine].isBlank() || TAG_PAIR_LINE.matcher(lines[firstMovetextLine].trim()).matches())) {
			firstMovetextLine++;
		}
		StringBuilder movetext = new StringBuilder();
		for (int i = firstMovetextLine; i < lines.length; i++) {
			movetext.append(lines[i]).append('\n');
		}
		return movetext.toString().trim();
	}
}
