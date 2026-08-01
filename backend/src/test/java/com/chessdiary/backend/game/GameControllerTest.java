package com.chessdiary.backend.game;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

import com.chessdiary.backend.security.SecurityConfig;
import com.chessdiary.backend.security.TestJwtDecoderConfig;
import com.chessdiary.backend.tournament.Tournament;
import com.chessdiary.backend.tournament.TournamentRepository;

import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = GameController.class)
@Import({ SecurityConfig.class, TestJwtDecoderConfig.class })
class GameControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private GameRepository gameRepository;

	@MockitoBean
	private TournamentRepository tournamentRepository;

	@Test
	void create_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/games")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void create_withValidTokenAndBody_isCreatedAsDraft() throws Exception {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
		when(gameRepository.save(any(Game.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/games")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("DRAFT"))
				.andExpect(jsonPath("$.opponent").value("Kasparov"));

		verify(gameRepository).save(any(Game.class));
	}

	@Test
	void create_withInvalidPgn_returnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/games")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								new GameRequest(1L, "not a real pgn", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)))))
				.andExpect(status().isBadRequest());
	}

	@Test
	void create_withUnknownTournament_returnsBadRequest() throws Exception {
		when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

		mockMvc.perform(post("/api/games")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								new GameRequest(99L, "1. e4 e5", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2)))))
				.andExpect(status().isBadRequest());
	}

	@Test
	void list_withoutAuthentication_returnsOnlyPublishedGames() throws Exception {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		Game published = new Game(tournament, "1. e4 e5", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
		published.publish();
		when(gameRepository.findByTournamentIdAndStatus(1L, Status.PUBLISHED)).thenReturn(List.of(published));

		mockMvc.perform(get("/api/tournaments/1/games"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].status").value("PUBLISHED"));

		verify(gameRepository).findByTournamentIdAndStatus(eq(1L), eq(Status.PUBLISHED));
	}

	@Test
	void list_withValidToken_returnsAllGamesIncludingDrafts() throws Exception {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		Game draft = new Game(tournament, "1. e4 e5", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
		when(gameRepository.findByTournamentId(1L)).thenReturn(List.of(draft));

		mockMvc.perform(get("/api/tournaments/1/games")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].status").value("DRAFT"));

		verify(gameRepository).findByTournamentId(1L);
	}

	@Test
	void getById_withExistingId_returnsGame() throws Exception {
		Tournament tournament = new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
		Game game = new Game(tournament, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
		when(gameRepository.findById(1L)).thenReturn(Optional.of(game));

		mockMvc.perform(get("/api/games/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.pgn").value("1. e4 e5 2. Nf3 Nc6"))
				.andExpect(jsonPath("$.opponent").value("Kasparov"));
	}

	@Test
	void getById_withUnknownId_returnsNotFound() throws Exception {
		when(gameRepository.findById(99L)).thenReturn(Optional.empty());

		mockMvc.perform(get("/api/games/99"))
				.andExpect(status().isNotFound());
	}

	private static GameRequest validRequest() {
		return new GameRequest(1L, "1. e4 e5 2. Nf3 Nc6", Color.WHITE, "Kasparov", LocalDate.of(2026, 8, 2));
	}
}
