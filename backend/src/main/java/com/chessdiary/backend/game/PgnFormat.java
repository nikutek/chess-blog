package com.chessdiary.backend.game;

import java.util.regex.Pattern;

// Structural check only: does this look like a PGN move sequence (starts with
// a move number followed by a move)? Chess legality is never validated here
// -- chess.js does that client-side (see ADR-0003).
final class PgnFormat {

	private static final Pattern STARTS_WITH_MOVE = Pattern.compile("^1\\.\\s*\\S+");

	private PgnFormat() {
	}

	static boolean isValid(String pgn) {
		return pgn != null && STARTS_WITH_MOVE.matcher(pgn.trim()).find();
	}
}
