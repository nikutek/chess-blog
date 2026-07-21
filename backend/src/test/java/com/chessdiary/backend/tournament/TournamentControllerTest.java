package com.chessdiary.backend.tournament;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.chessdiary.backend.security.SecurityConfig;
import com.chessdiary.backend.security.TestJwtDecoderConfig;
import tools.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = TournamentController.class)
@Import({ SecurityConfig.class, TestJwtDecoderConfig.class })
class TournamentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private TournamentRepository repository;

	@Test
	void listIsPublic() throws Exception {
		when(repository.findAll())
				.thenReturn(List.of(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1))));

		mockMvc.perform(get("/api/tournaments"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("City Open"));
	}

	@Test
	void create_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/tournaments")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void create_withValidTokenAndBody_isCreated() throws Exception {
		when(repository.save(any(Tournament.class))).thenAnswer(invocation -> invocation.getArgument(0));

		mockMvc.perform(post("/api/tournaments")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(validRequest())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("City Open"));

		verify(repository).save(any(Tournament.class));
	}

	@Test
	void create_withValidTokenAndMissingName_returnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/tournaments")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(new TournamentRequest("", "Warsaw", LocalDate.of(2026, 8, 1)))))
				.andExpect(status().isBadRequest());
	}

	private static TournamentRequest validRequest() {
		return new TournamentRequest("City Open", "Warsaw", LocalDate.of(2026, 8, 1));
	}
}
