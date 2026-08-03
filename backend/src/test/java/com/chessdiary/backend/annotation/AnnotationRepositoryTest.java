package com.chessdiary.backend.annotation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import com.chessdiary.backend.game.Color;
import com.chessdiary.backend.game.Game;
import com.chessdiary.backend.game.GameRepository;
import com.chessdiary.backend.tournament.Tournament;
import com.chessdiary.backend.tournament.TournamentRepository;

@DataJpaTest
@TestPropertySource(properties = {
		"spring.flyway.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop" })
class AnnotationRepositoryTest {

	@Autowired
	private AnnotationRepository annotationRepository;

	@Autowired
	private GameRepository gameRepository;

	@Autowired
	private TournamentRepository tournamentRepository;

	@Test
	void savesAndFindsAnAnnotationByGameAndFen() {
		Game game = aGame();
		annotationRepository.save(new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "Solid opening choice."));

		Optional<Annotation> found = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.MAIN_LINE, null, "startpos");

		assertTrue(found.isPresent());
		assertEquals("Solid opening choice.", found.get().getText());
	}

	@Test
	void findByFenReturnsEmptyWhenNoAnnotationExists() {
		Game game = aGame();

		Optional<Annotation> found = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.MAIN_LINE, null, "startpos");

		assertTrue(found.isEmpty());
	}

	private Game aGame() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		return gameRepository.save(new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));
	}
}
