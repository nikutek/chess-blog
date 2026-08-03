package com.chessdiary.backend.sideline;

import jakarta.validation.constraints.NotBlank;

public record SidelineUpdateRequest(@NotBlank String pgn, String description) {
}
