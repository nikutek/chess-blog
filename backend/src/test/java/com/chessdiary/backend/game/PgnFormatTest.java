package com.chessdiary.backend.game;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

// Only checks that the string is structurally shaped like a PGN move sequence
// (starts with a move number, e.g. "1."). Chess legality is never validated
// on the backend -- chess.js does that client-side (see ADR-0003).
class PgnFormatTest {

	@Test
	void acceptsAStandardMoveSequence() {
		assertTrue(PgnFormat.isValid("1. e4 e5 2. Nf3 Nc6"));
	}

	@Test
	void acceptsASingleMove() {
		assertTrue(PgnFormat.isValid("1. e4"));
	}

	@Test
	void rejectsBlank() {
		assertFalse(PgnFormat.isValid("   "));
	}

	@Test
	void rejectsTextWithoutMoveNumbers() {
		assertFalse(PgnFormat.isValid("not a real pgn"));
	}

	@Test
	void rejectsMoveNumberWithNoMoveAfterIt() {
		assertFalse(PgnFormat.isValid("1."));
	}

	@Test
	void acceptsAMoveSequencePrecededByTagPairHeaders() {
		String pgn = "[Event \"Titled Tuesday\"]\n[Site \"chess.com\"]\n[Date \"2026.08.02\"]\n\n1. e4 e5 2. Nf3 Nc6";

		assertTrue(PgnFormat.isValid(pgn));
	}

	@Test
	void rejectsTagPairHeadersWithNoMovesAfterThem() {
		String pgn = "[Event \"Titled Tuesday\"]\n[Site \"chess.com\"]";

		assertFalse(PgnFormat.isValid(pgn));
	}
}
