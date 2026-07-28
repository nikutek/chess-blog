package com.chessdiary.backend.game;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PgnValidator.class)
public @interface ValidPgn {

	String message() default "pgn must be a valid move sequence, e.g. '1. e4 e5 2. Nf3 Nc6'";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
