package com.chessdiary.backend.security;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

// Shared by any @WebMvcTest that needs to exercise SecurityConfig: provides a
// JwtDecoder backed by a locally generated key pair (so tests never call the
// real Supabase JWKS endpoint) plus matching helpers to mint tokens signed
// with that same key pair.
@TestConfiguration
public class TestJwtDecoderConfig {

	private static final KeyPair KEY_PAIR = generateKeyPair();

	@Bean
	JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withPublicKey((RSAPublicKey) KEY_PAIR.getPublic()).build();
	}

	public static String validToken() throws Exception {
		return sign(Instant.now(), Instant.now().plusSeconds(3600));
	}

	public static String expiredToken() throws Exception {
		return sign(Instant.now().minusSeconds(7200), Instant.now().minusSeconds(3600));
	}

	public static String tamper(String token) {
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

	private static String sign(Instant issuedAt, Instant expiresAt) throws Exception {
		JWTClaimsSet claims = new JWTClaimsSet.Builder()
				.subject("test-author")
				.issuer("https://test-project.supabase.co/auth/v1")
				.issueTime(Date.from(issuedAt))
				.expirationTime(Date.from(expiresAt))
				.build();
		SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
		jwt.sign(new RSASSASigner((RSAPrivateKey) KEY_PAIR.getPrivate()));
		return jwt.serialize();
	}

	private static KeyPair generateKeyPair() {
		try {
			KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
			generator.initialize(2048);
			return generator.generateKeyPair();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
}
