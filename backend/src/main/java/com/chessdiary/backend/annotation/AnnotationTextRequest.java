package com.chessdiary.backend.annotation;

import jakarta.validation.constraints.NotBlank;

public record AnnotationTextRequest(@NotBlank String text) {
}
