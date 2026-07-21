package com.chessdiary.backend.tournament;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

// Flyway is disabled here: its migrations are written in Postgres SQL (e.g.
// BIGSERIAL) and this slice runs against an in-memory H2 database instead of
// real Postgres, so the schema is derived from the entity mapping (ddl-auto,
// see DataJpaTest defaults) rather than replayed from db/migration.
@DataJpaTest
@TestPropertySource(properties = {
		"spring.flyway.enabled=false",
		"spring.jpa.hibernate.ddl-auto=create-drop" })
class TournamentRepositoryTest {

	@Autowired
	private TournamentRepository repository;

	@Test
	void savesAndFindsATournament() {
		Tournament saved = repository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));

		assertTrue(repository.findById(saved.getId()).isPresent());
	}

	@Test
	void findAllReturnsEveryTournament() {
		repository.save(new Tournament("City Open", "Warsaw", LocalDate.of(2026, 8, 1)));
		repository.save(new Tournament("Summer Cup", "Krakow", LocalDate.of(2026, 9, 1)));

		List<Tournament> tournaments = repository.findAll();

		assertEquals(2, tournaments.size());
	}
}
