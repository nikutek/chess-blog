package com.chessdiary.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Datasource autoconfiguration is excluded here because this smoke test only
// verifies the Spring context wires up; real Postgres connectivity is
// verified manually against Supabase (see acceptance criteria for scaffolding).
@SpringBootTest(properties = "spring.autoconfigure.exclude="
		+ "org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration,"
		+ "org.springframework.boot.jdbc.autoconfigure.DataSourceTransactionManagerAutoConfiguration,"
		+ "org.springframework.boot.jpa.autoconfigure.HibernateJpaAutoConfiguration")
class ChessDiaryBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
