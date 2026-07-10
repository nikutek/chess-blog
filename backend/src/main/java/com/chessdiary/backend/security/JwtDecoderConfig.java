package com.chessdiary.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
		return NimbusJwtDecoder.withJwkSetUri(jwksUri).build();
	}
}
