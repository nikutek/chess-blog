package com.chessdiary.backend.annotation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.chessdiary.backend.game.Color;
import com.chessdiary.backend.game.Game;
import com.chessdiary.backend.game.GameRepository;
import com.chessdiary.backend.security.SecurityConfig;
import com.chessdiary.backend.security.TestJwtDecoderConfig;
import com.chessdiary.backend.tournament.Tournament;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AnnotationController.class)
@Import({ SecurityConfig.class, TestJwtDecoderConfig.class })
class AnnotationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private AnnotationRepository annotationRepository;

	@MockitoBean
	private GameRepository gameRepository;

	@Test
	void create_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/games/1/annotations")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AnnotationRequest("startpos", "text"))))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void create_withValidToken_isCreated() throws Exception {
		Game game = aGame();
		when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
		when(annotationRepository.save(any(Annotation.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/games/1/annotations")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AnnotationRequest("startpos", "Solid opening choice."))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.fen").value("startpos"))
				.andExpect(jsonPath("$.text").value("Solid opening choice."));
	}

	@Test
	void getByFen_whenAnnotationExists_returnsIt() throws Exception {
		Game game = aGame();
		Annotation annotation = new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "Solid opening choice.");
		when(annotationRepository.findByGameIdAndContextTypeAndSidelineIdAndFen(1L, ContextType.MAIN_LINE, null, "startpos"))
				.thenReturn(Optional.of(annotation));

		mockMvc.perform(get("/api/games/1/annotations").param("fen", "startpos"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.text").value("Solid opening choice."));
	}

	@Test
	void getByFen_whenNoAnnotationExists_returnsNotFound() throws Exception {
		when(annotationRepository.findByGameIdAndContextTypeAndSidelineIdAndFen(1L, ContextType.MAIN_LINE, null, "startpos"))
				.thenReturn(Optional.empty());

		mockMvc.perform(get("/api/games/1/annotations").param("fen", "startpos"))
				.andExpect(status().isNotFound());
	}

	@Test
	void update_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(put("/api/games/1/annotations/5")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AnnotationTextRequest("new text"))))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void update_withValidToken_updatesText() throws Exception {
		Game game = aGame();
		Annotation annotation = new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "old text");
		when(annotationRepository.findById(5L)).thenReturn(Optional.of(annotation));
		when(annotationRepository.save(any(Annotation.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(put("/api/games/1/annotations/5")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new AnnotationTextRequest("new text"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.text").value("new text"));
	}

	@Test
	void delete_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(delete("/api/games/1/annotations/5"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void delete_withValidToken_removesAnnotation() throws Exception {
		Game game = aGame();
		Annotation annotation = new Annotation(game, ContextType.MAIN_LINE, null, "startpos", "text");
		when(annotationRepository.findById(5L)).thenReturn(Optional.of(annotation));

		mockMvc.perform(delete("/api/games/1/annotations/5")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken()))
				.andExpect(status().isNoContent());

		verify(annotationRepository).delete(annotation);
	}

	private static Game aGame() {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		return new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
	}
}
