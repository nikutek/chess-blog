package com.chessdiary.backend.game;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GameRequest(
		@NotNull Long tournamentId,
		@NotBlank @ValidPgn String pgn,
		@NotNull Color color,
		@NotBlank String opponent,
		@NotNull LocalDate date) {
}
