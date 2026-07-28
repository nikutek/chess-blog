package com.chessdiary.backend.game;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

	@GetMapping("/tournaments/{tournamentId}/games")
	public List<Game> list(@PathVariable Long tournamentId, Authentication authentication) {
		boolean authenticated = authentication != null
				&& authentication.isAuthenticated()
				&& !(authentication instanceof AnonymousAuthenticationToken);
		if (authenticated) {
			return gameRepository.findByTournamentId(tournamentId);
		}
		return gameRepository.findByTournamentIdAndStatus(tournamentId, Status.PUBLISHED);
	}
}
