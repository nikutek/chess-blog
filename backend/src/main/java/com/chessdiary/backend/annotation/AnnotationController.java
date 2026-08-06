package com.chessdiary.backend.annotation;

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

@RestController
@RequestMapping("/api/games/{gameId}/annotations")
public class AnnotationController {

	private final AnnotationRepository annotationRepository;
	private final GameRepository gameRepository;

	public AnnotationController(AnnotationRepository annotationRepository, GameRepository gameRepository) {
		this.annotationRepository = annotationRepository;
		this.gameRepository = gameRepository;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Annotation create(@PathVariable Long gameId, @Valid @RequestBody AnnotationRequest request) {
		Game game = gameRepository.findById(gameId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "game not found"));
		ContextType contextType = request.sidelineId() != null ? ContextType.SIDELINE : ContextType.MAIN_LINE;
		Annotation annotation = new Annotation(game, contextType, request.sidelineId(), request.fen(), request.text());
		return annotationRepository.save(annotation);
	}

	@GetMapping
	public List<Annotation> list(@PathVariable Long gameId) {
		return annotationRepository.findByGameId(gameId);
	}

	@PutMapping("/{id}")
	public Annotation update(@PathVariable Long gameId, @PathVariable Long id, @Valid @RequestBody AnnotationTextRequest request) {
		Annotation annotation = findAnnotationOrThrow(id);
		annotation.setText(request.text());
		return annotationRepository.save(annotation);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long gameId, @PathVariable Long id) {
		Annotation annotation = findAnnotationOrThrow(id);
		annotationRepository.delete(annotation);
	}

	private Annotation findAnnotationOrThrow(Long id) {
		return annotationRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "annotation not found"));
	}
}
