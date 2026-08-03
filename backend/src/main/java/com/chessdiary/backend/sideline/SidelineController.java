package com.chessdiary.backend.sideline;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.chessdiary.backend.game.Game;
import com.chessdiary.backend.game.GameRepository;

import jakarta.validation.Valid;

// Only top-level sidelines are supported for now (parentSidelineId always null).
// Nesting is added in a later slice, reusing this same entity/schema (see ADR-0003).
@RestController
@RequestMapping("/api/games/{gameId}/sidelines")
public class SidelineController {

	private final SidelineRepository sidelineRepository;
	private final GameRepository gameRepository;

	public SidelineController(SidelineRepository sidelineRepository, GameRepository gameRepository) {
		this.sidelineRepository = sidelineRepository;
		this.gameRepository = gameRepository;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Sideline create(@PathVariable Long gameId, @Valid @RequestBody SidelineRequest request) {
		Game game = gameRepository.findById(gameId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "game not found"));
		Sideline sideline = new Sideline(game, null, request.branchFen(), request.pgn(), request.description());
		return sidelineRepository.save(sideline);
	}

	@GetMapping
	public List<Sideline> list(@PathVariable Long gameId) {
		return sidelineRepository.findByGameId(gameId);
	}

	@PutMapping("/{id}")
	public Sideline update(@PathVariable Long gameId, @PathVariable Long id, @Valid @RequestBody SidelineUpdateRequest request) {
		Sideline sideline = findSidelineOrThrow(id);
		sideline.update(request.pgn(), request.description());
		return sidelineRepository.save(sideline);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long gameId, @PathVariable Long id) {
		Sideline sideline = findSidelineOrThrow(id);
		sidelineRepository.delete(sideline);
	}

	private Sideline findSidelineOrThrow(Long id) {
		return sidelineRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "sideline not found"));
	}
}
