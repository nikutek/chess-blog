package com.chessdiary.backend.sideline;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SidelineRepository extends JpaRepository<Sideline, Long> {

	List<Sideline> findByGameId(Long gameId);

	List<Sideline> findByParentSidelineId(Long parentSidelineId);
}
