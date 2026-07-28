package com.chessdiary.backend.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import com.chessdiary.backend.tournament.Tournament;
import com.chessdiary.backend.tournament.TournamentRepository;

// Flyway disabled for the same reason as TournamentRepositoryTest: migrations
// are Postgres SQL, this test runs against H2 with a schema derived from the
// entity mapping.
@DataJpaTest
@TestPropertySource(properties = {
		"spring.flyway.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop" })
class GameRepositoryTest {

	@Autowired
	private GameRepository gameRepository;

	@Autowired
	private TournamentRepository tournamentRepository;

	@Test
	void savesAndFindsAGame() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		Game saved = gameRepository.save(new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));

		assertTrue(gameRepository.findById(saved.getId()).isPresent());
	}

	@Test
	void newGameStartsAsDraft() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		Game saved = gameRepository.save(new Game(tournament, "1. e4 e5", Color.BLACK, "Karpov", LocalDate.of(2026, 8, 2)));

		assertEquals(Status.DRAFT, saved.getStatus());
	}

	@Test
	void findByTournamentIdReturnsOnlyGamesFromThatTournament() {
		Tournament tournamentA = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		Tournament tournamentB = tournamentRepository.save(new Tournament("Summer Cup", "Krakow", LocalDate.of(2026, 9, 1)));
		gameRepository.save(new Game(tournamentA, "1. e4 e5", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));
		gameRepository.save(new Game(tournamentB, "1. d4 d5", Color.BLACK, "Karpov", LocalDate.of(2026, 9, 2)));

		List<Game> games = gameRepository.findByTournamentId(tournamentA.getId());

		assertEquals(1, games.size());
	}

	@Test
	void findByTournamentIdAndStatusReturnsOnlyMatchingGames() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		Game draft = gameRepository.save(new Game(tournament, "1. e4 e5", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));
		Game published = gameRepository.save(new Game(tournament, "1. d4 d5", Color.BLACK, "Karpov", LocalDate.of(2026, 8, 3)));
		published.publish();
		gameRepository.save(published);

		List<Game> publishedGames = gameRepository.findByTournamentIdAndStatus(tournament.getId(), Status.PUBLISHED);

		assertEquals(1, publishedGames.size());
		assertEquals(published.getId(), publishedGames.get(0).getId());
	}
}
