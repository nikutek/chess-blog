package com.chessdiary.backend.game;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PgnValidator implements ConstraintValidator<ValidPgn, String> {

	@Override
	public boolean isValid(String pgn, ConstraintValidatorContext context) {
		return PgnFormat.isValid(pgn);
	}
}
