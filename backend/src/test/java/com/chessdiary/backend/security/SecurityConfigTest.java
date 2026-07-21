package com.chessdiary.backend.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

// Verifies the security filter chain in isolation: a test-only controller stands
// in for real endpoints (none exist yet), and the JwtDecoder is swapped for one
// backed by a locally generated key pair so tests never call the real Supabase
// JWKS endpoint. Production wiring (JwtDecoderConfig, fetching Supabase's JWKS
// over the network) is exercised manually / in the deployed environment.
@WebMvcTest(controllers = PingTestController.class)
@Import({ SecurityConfig.class, TestJwtDecoderConfig.class })
class SecurityConfigTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void publicGetEndpoint_isAccessibleWithoutToken() throws Exception {
		mockMvc.perform(get("/api/ping")).andExpect(status().isOk());
	}

	@Test
	void protectedEndpoint_withoutAuthorizationHeader_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/ping")).andExpect(status().isUnauthorized());
	}

	@Test
	void protectedEndpoint_withValidToken_isAccepted() throws Exception {
		mockMvc.perform(post("/api/ping").header("Authorization", "Bearer " + TestJwtDecoderConfig.validToken()))
				.andExpect(status().isOk());
	}

	@Test
	void protectedEndpoint_withExpiredToken_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/ping").header("Authorization", "Bearer " + TestJwtDecoderConfig.expiredToken()))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void protectedEndpoint_withTamperedToken_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/ping")
						.header("Authorization", "Bearer " + TestJwtDecoderConfig.tamper(TestJwtDecoderConfig.validToken())))
				.andExpect(status().isUnauthorized());
	}
}
