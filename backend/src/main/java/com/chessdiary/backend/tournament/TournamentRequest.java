package com.chessdiary.backend.tournament;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TournamentRequest(
		@NotBlank String name,
		@NotBlank String location,
		@NotNull LocalDate date) {
}
