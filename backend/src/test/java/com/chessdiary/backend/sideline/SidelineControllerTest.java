package com.chessdiary.backend.sideline;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.chessdiary.backend.annotation.AnnotationRepository;
import com.chessdiary.backend.game.Color;
import com.chessdiary.backend.game.Game;
import com.chessdiary.backend.game.GameRepository;
import com.chessdiary.backend.security.SecurityConfig;
import com.chessdiary.backend.security.TestJwtDecoderConfig;
import com.chessdiary.backend.tournament.Tournament;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = SidelineController.class)
@Import({ SecurityConfig.class, TestJwtDecoderConfig.class })
class SidelineControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private SidelineRepository sidelineRepository;

	@MockitoBean
	private GameRepository gameRepository;

	@MockitoBean
	private AnnotationRepository annotationRepository;

	@Test
	void create_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/games/1/sidelines")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void create_withValidToken_isCreated() throws Exception {
		Game game = aGame();
		when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
		when(sidelineRepository.save(any(Sideline.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/games/1/sidelines")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.branchFen").value("startpos"))
				.andExpect(jsonPath("$.pgn").value("1. Nc3 Nf6"))
				.andExpect(jsonPath("$.description").value("A quieter alternative to Nf3."));
	}

	@Test
	void create_withParentSidelineId_isCreatedAsNestedSideline() throws Exception {
		Game game = aGame();
		when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
		when(sidelineRepository.save(any(Sideline.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/games/1/sidelines")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								new SidelineRequest("startpos", "1... Nf6", "Nested reply.", 3L))))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.parentSidelineId").value(3));
	}

	@Test
	void list_returnsAllSidelinesForTheGame() throws Exception {
		Game game = aGame();
		Sideline sideline = new Sideline(game, null, "startpos", "1. Nc3 Nf6", "desc");
		when(sidelineRepository.findByGameId(1L)).thenReturn(List.of(sideline));

		mockMvc.perform(get("/api/games/1/sidelines"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].pgn").value("1. Nc3 Nf6"));
	}

	@Test
	void update_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(put("/api/games/1/sidelines/5")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new SidelineUpdateRequest("1. Nc3 Nf6", "new desc"))))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void update_withValidToken_updatesPgnAndDescription() throws Exception {
		Game game = aGame();
		Sideline sideline = new Sideline(game, null, "startpos", "1. Nc3", "old desc");
		when(sidelineRepository.findById(5L)).thenReturn(Optional.of(sideline));
		when(sidelineRepository.save(any(Sideline.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(put("/api/games/1/sidelines/5")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new SidelineUpdateRequest("1. Nc3 Nf6", "new desc"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pgn").value("1. Nc3 Nf6"))
				.andExpect(jsonPath("$.description").value("new desc"));
	}

	@Test
	void delete_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(delete("/api/games/1/sidelines/5"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void delete_withValidToken_removesSidelineAndItsAnnotations() throws Exception {
		Game game = aGame();
		Sideline sideline = new Sideline(game, null, "startpos", "1. Nc3", "desc");
		when(sidelineRepository.findById(5L)).thenReturn(Optional.of(sideline));
		when(sidelineRepository.findByParentSidelineId(null)).thenReturn(List.of());

		mockMvc.perform(delete("/api/games/1/sidelines/5")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken()))
				.andExpect(status().isNoContent());

		verify(annotationRepository).deleteBySidelineId(null);
		verify(sidelineRepository).delete(sideline);
	}

	@Test
	void delete_cascadesToChildSidelinesAndTheirAnnotations() throws Exception {
		Game game = aGame();
		Sideline root = new Sideline(game, null, "startpos", "1. Nc3", "desc");
		Sideline child = new Sideline(game, null, "fen-nested", "1... Nf6", "nested desc");
		when(sidelineRepository.findById(5L)).thenReturn(Optional.of(root));
		when(sidelineRepository.findByParentSidelineId(null)).thenReturn(List.of(child)).thenReturn(List.of());

		mockMvc.perform(delete("/api/games/1/sidelines/5")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken()))
				.andExpect(status().isNoContent());

		verify(annotationRepository, times(2)).deleteBySidelineId(null);
		verify(sidelineRepository).delete(child);
		verify(sidelineRepository).delete(root);
	}

	private static SidelineRequest validRequest() {
		return new SidelineRequest("startpos", "1. Nc3 Nf6", "A quieter alternative to Nf3.", null);
	}

	private static Game aGame() {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		return new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
	}
}
