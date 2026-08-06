package com.chessdiary.backend.sideline;

import jakarta.validation.constraints.NotBlank;

public record SidelineRequest(@NotBlank String branchFen, @NotBlank String pgn, String description, Long parentSidelineId) {
}
