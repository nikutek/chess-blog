package com.chessdiary.backend.game;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.chessdiary.backend.tournament.Tournament;
import com.chessdiary.backend.tournament.TournamentRepository;

import jakarta.validation.Valid;

// POST requires a valid JWT (blanket rule in SecurityConfig). The GET list
// endpoint is public at the security-filter level (GET permitAll), so draft
// visibility is enforced here instead: an authenticated caller sees every
// Game in the Tournament, an anonymous one sees only Published Games.
@RestController
@RequestMapping("/api")
public class GameController {

	private final GameRepository gameRepository;
	private final TournamentRepository tournamentRepository;

	public GameController(GameRepository gameRepository, TournamentRepository tournamentRepository) {
		this.gameRepository = gameRepository;
		this.tournamentRepository = tournamentRepository;
	}

	@PostMapping("/games")
	@ResponseStatus(HttpStatus.CREATED)
	public Game create(@Valid @RequestBody GameRequest request) {
		Tournament tournament = tournamentRepository.findById(request.tournamentId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "tournament not found"));
		Game game = new Game(tournament, request.pgn(), request.color(), request.opponent(), request.date());
		return gameRepository.save(game);
	}

	@GetMapping("/games/{id}")
	public Game getById(@PathVariable Long id, Authentication authentication) {
		Game game = findGameOrThrow(id);
		if (game.getStatus() != Status.PUBLISHED && !isAuthenticated(authentication)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "game not found");
		}
		return game;
	}

	@PostMapping("/games/{id}/publish")
	public Game publish(@PathVariable Long id) {
		Game game = findGameOrThrow(id);
		game.publish();
		return gameRepository.save(game);
	}

	@PostMapping("/games/{id}/unpublish")
	public Game unpublish(@PathVariable Long id) {
		Game game = findGameOrThrow(id);
		game.unpublish();
		return gameRepository.save(game);
	}

	// A literal "/games" collection route, kept distinct from "/games/{id}"
	// rather than "/games/recent" (which ambiguously overlapped with the
	// {id} path variable at request-mapping time).
	@GetMapping("/games")
	public List<Game> recent(@RequestParam(defaultValue = "4") int limit) {
		return gameRepository.findByStatusOrderByDateDesc(Status.PUBLISHED, PageRequest.of(0, limit));
	}

	@GetMapping("/tournaments/{tournamentId}/games")
	public List<Game> list(@PathVariable Long tournamentId, Authentication authentication) {
		if (isAuthenticated(authentication)) {
			return gameRepository.findByTournamentId(tournamentId);
		}
		return gameRepository.findByTournamentIdAndStatus(tournamentId, Status.PUBLISHED);
	}

	private Game findGameOrThrow(Long id) {
		return gameRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "game not found"));
	}

	private static boolean isAuthenticated(Authentication authentication) {
		return authentication != null
				&& authentication.isAuthenticated()
				&& !(authentication instanceof AnonymousAuthenticationToken);
	}
}
