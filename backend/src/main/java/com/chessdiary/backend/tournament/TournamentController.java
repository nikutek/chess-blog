package com.chessdiary.backend.tournament;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

// GET is public and POST requires a valid JWT: enforced by the blanket rule in
// SecurityConfig (permitAll on GET, authenticated otherwise), so no per-endpoint
// security annotation is needed here.
@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

	private final TournamentRepository repository;

	public TournamentController(TournamentRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	public List<Tournament> list() {
		return repository.findAll();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Tournament create(@Valid @RequestBody TournamentRequest request) {
		Tournament tournament = new Tournament(request.name(), request.location(), request.date());
		return repository.save(tournament);
	}
}
