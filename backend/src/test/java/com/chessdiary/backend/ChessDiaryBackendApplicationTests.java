package com.chessdiary.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Runs against an in-memory H2 database (schema created from entity mappings,
// Flyway disabled) rather than excluding datasource/JPA autoconfiguration:
// now that repository-backed beans exist (e.g. TournamentController), the
// context can't wire up without *some* DataSource. Real Postgres connectivity
// and the real Flyway migration are verified manually against Supabase.
@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:smoke;DB_CLOSE_DELAY=-1",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.flyway.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		// JwtDecoder is only resolved lazily on first use, so a placeholder is enough
		// to satisfy property binding without hitting a real Supabase project.
		"supabase.url=https://test.supabase.co" })
class ChessDiaryBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
