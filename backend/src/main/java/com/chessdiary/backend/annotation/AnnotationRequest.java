package com.chessdiary.backend.annotation;

import jakarta.validation.constraints.NotBlank;

public record AnnotationRequest(@NotBlank String fen, @NotBlank String text) {
}
