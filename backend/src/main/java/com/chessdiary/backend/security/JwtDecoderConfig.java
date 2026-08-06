package com.chessdiary.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

// Kept separate from SecurityConfig so slice tests can @Import the filter chain
// without also pulling in this bean, and substitute a JwtDecoder backed by a
// local test key pair instead of hitting Supabase's real JWKS endpoint.
@Configuration
public class JwtDecoderConfig {

	@Bean
	JwtDecoder jwtDecoder(@Value("${supabase.url}") String supabaseUrl) {
		String jwksUri = supabaseUrl + "/auth/v1/.well-known/jwks.json";
		// Supabase signs with ES256 (asymmetric JWT signing keys), not the RS256
		// NimbusJwtDecoder assumes by default when given a bare JWKS URI. Declaring
		// it explicitly (rather than discoverJwsAlgorithms(), which fetches the JWKS
		// eagerly at bean creation) keeps JWKS resolution lazy on first decode -
		// see ChessDiaryBackendApplicationTests, which relies on that laziness to
		// boot with a placeholder supabase.url that has no real JWKS endpoint.
		return NimbusJwtDecoder.withJwkSetUri(jwksUri).jwsAlgorithm(SignatureAlgorithm.ES256).build();
	}
}
