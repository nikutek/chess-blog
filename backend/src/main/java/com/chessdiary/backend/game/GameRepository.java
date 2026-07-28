package com.chessdiary.backend.game;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {

	List<Game> findByTournamentId(Long tournamentId);

	List<Game> findByTournamentIdAndStatus(Long tournamentId, Status status);
}
