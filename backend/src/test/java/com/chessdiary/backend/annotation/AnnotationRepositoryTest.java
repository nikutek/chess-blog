package com.chessdiary.backend.annotation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
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

	@Test
	void sameFenInTwoDifferentSidelinesCarriesIndependentAnnotations() {
		Game game = aGame();
		annotationRepository.save(new Annotation(game, ContextType.SIDELINE, 1L, "startpos", "In sideline 1."));
		annotationRepository.save(new Annotation(game, ContextType.SIDELINE, 2L, "startpos", "In sideline 2."));

		Optional<Annotation> inSidelineOne = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.SIDELINE, 1L, "startpos");
		Optional<Annotation> inSidelineTwo = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.SIDELINE, 2L, "startpos");

		assertTrue(inSidelineOne.isPresent());
		assertTrue(inSidelineTwo.isPresent());
		assertEquals("In sideline 1.", inSidelineOne.get().getText());
		assertEquals("In sideline 2.", inSidelineTwo.get().getText());
	}

	@Test
	void sidelineAnnotationDoesNotConflictWithMainLineAnnotationAtSameFen() {
		Game game = aGame();
		annotationRepository.save(new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "On the main line."));
		annotationRepository.save(new Annotation(game, ContextType.SIDELINE, 1L, "startpos", "In the sideline."));

		Optional<Annotation> mainLine = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.MAIN_LINE, null, "startpos");
		Optional<Annotation> sideline = annotationRepository
				.findByGameIdAndContextTypeAndSidelineIdAndFen(game.getId(), ContextType.SIDELINE, 1L, "startpos");

		assertTrue(mainLine.isPresent());
		assertTrue(sideline.isPresent());
		assertEquals("On the main line.", mainLine.get().getText());
		assertEquals("In the sideline.", sideline.get().getText());
	}

	@Test
	void findByGameIdReturnsAnnotationsFromEveryContext() {
		Game game = aGame();
		annotationRepository.save(new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "Main."));
		annotationRepository.save(new Annotation(game, ContextType.SIDELINE, 1L, "startpos", "Sideline."));

		List<Annotation> all = annotationRepository.findByGameId(game.getId());

		assertEquals(2, all.size());
	}

	private Game aGame() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		return gameRepository.save(new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));
	}
}
