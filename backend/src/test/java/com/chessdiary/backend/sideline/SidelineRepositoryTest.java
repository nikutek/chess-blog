package com.chessdiary.backend.sideline;

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
class SidelineRepositoryTest {

	@Autowired
	private SidelineRepository sidelineRepository;

	@Autowired
	private GameRepository gameRepository;

	@Autowired
	private TournamentRepository tournamentRepository;

	@Test
	void savesAndRetrievesASidelineById() {
		Game game = aGame();
		Sideline saved = sidelineRepository.save(
				new Sideline(game, null, "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
						"1. Nc3 Nf6", "A quieter alternative to Nf3."));

		Optional<Sideline> found = sidelineRepository.findById(saved.getId());

		assertTrue(found.isPresent());
		assertEquals("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", found.get().getBranchFen());
		assertEquals("1. Nc3 Nf6", found.get().getPgn());
		assertEquals("A quieter alternative to Nf3.", found.get().getDescription());
	}

	@Test
	void findByGameIdReturnsOnlySidelinesFromThatGame() {
		Game gameA = aGame();
		Game gameB = aGame();
		sidelineRepository.save(new Sideline(gameA, null, "fen-a", "1. Nc3", null));
		sidelineRepository.save(new Sideline(gameB, null, "fen-b", "1. d4", null));

		List<Sideline> sidelines = sidelineRepository.findByGameId(gameA.getId());

		assertEquals(1, sidelines.size());
		assertEquals("fen-a", sidelines.get(0).getBranchFen());
	}

	@Test
	void savesATwoLevelDeepSidelineTreeWithCorrectParentChain() {
		Game game = aGame();
		Sideline root = sidelineRepository.save(new Sideline(game, null, "fen-root", "1. Nc3", null));
		Sideline nested = sidelineRepository.save(
				new Sideline(game, root.getId(), "fen-nested", "1... Nf6", "Nested reply."));

		List<Sideline> children = sidelineRepository.findByParentSidelineId(root.getId());

		assertEquals(1, children.size());
		assertEquals(nested.getId(), children.get(0).getId());
		assertEquals(root.getId(), children.get(0).getParentSidelineId());
	}

	@Test
	void findByParentSidelineIdReturnsEmptyWhenThereAreNoChildren() {
		Game game = aGame();
		Sideline root = sidelineRepository.save(new Sideline(game, null, "fen-root", "1. Nc3", null));

		List<Sideline> children = sidelineRepository.findByParentSidelineId(root.getId());

		assertEquals(0, children.size());
	}

	private Game aGame() {
		Tournament tournament = tournamentRepository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		return gameRepository.save(new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)));
	}
}
