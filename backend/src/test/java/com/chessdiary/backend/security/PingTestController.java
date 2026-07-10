package com.chessdiary.backend.security;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

// Test-only stand-in for real endpoints (none exist yet); exercised by
// SecurityConfigTest to verify the security filter chain's behavior.
@RestController
public class PingTestController {

	@GetMapping("/api/ping")
	public String publicPing() {
		return "pong";
	}

	@PostMapping("/api/ping")
	public String protectedPing() {
		return "pong";
	}
}
