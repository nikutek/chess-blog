package com.chessdiary.backend.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

// Verifies the security filter chain in isolation: a test-only controller stands
// in for real endpoints (none exist yet), and the JwtDecoder is swapped for one
// backed by a locally generated key pair so tests never call the real Supabase
// JWKS endpoint. Production wiring (JwtDecoderConfig, fetching Supabase's JWKS
// over the network) is exercised manually / in the deployed environment.
@WebMvcTest(controllers = PingTestController.class)
@Import({ SecurityConfig.class, SecurityConfigTest.TestJwtDecoderConfig.class })
class SecurityConfigTest {

	private static KeyPair keyPair;

	@Autowired
	private MockMvc mockMvc;

	@BeforeAll
	static void generateKeyPair() throws Exception {
		KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
		generator.initialize(2048);
		keyPair = generator.generateKeyPair();
	}

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
		mockMvc.perform(post("/api/ping").header("Authorization", "Bearer " + validToken()))
				.andExpect(status().isOk());
	}

	@Test
	void protectedEndpoint_withExpiredToken_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/ping").header("Authorization", "Bearer " + expiredToken()))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void protectedEndpoint_withTamperedToken_returnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/ping").header("Authorization", "Bearer " + tamper(validToken())))
				.andExpect(status().isUnauthorized());
	}

	private static String validToken() throws Exception {
		return sign(Instant.now(), Instant.now().plusSeconds(3600));
	}

	private static String expiredToken() throws Exception {
		return sign(Instant.now().minusSeconds(7200), Instant.now().minusSeconds(3600));
	}

	private static String sign(Instant issuedAt, Instant expiresAt) throws Exception {
		JWTClaimsSet claims = new JWTClaimsSet.Builder()
				.subject("test-author")
				.issuer("https://test-project.supabase.co/auth/v1")
				.issueTime(Date.from(issuedAt))
				.expirationTime(Date.from(expiresAt))
				.build();
		SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
		jwt.sign(new RSASSASigner((RSAPrivateKey) keyPair.getPrivate()));
		return jwt.serialize();
	}

	private static String tamper(String token) {
		// Flips a character in the middle of the signature rather than the last
		// one: the final base64url group of a 2048-bit RSA signature only carries
		// 2 significant bits (the rest is padding), so some edits there decode to
		// the same byte and leave the signature valid.
		String[] parts = token.split("\\.");
		char[] signature = parts[2].toCharArray();
		int middle = signature.length / 2;
		signature[middle] = signature[middle] == 'A' ? 'B' : 'A';
		parts[2] = new String(signature);
		return parts[0] + "." + parts[1] + "." + parts[2];
	}

	@TestConfiguration
	static class TestJwtDecoderConfig {
		@Bean
		JwtDecoder jwtDecoder() {
			return NimbusJwtDecoder.withPublicKey((RSAPublicKey) keyPair.getPublic()).build();
		}
	}
}
