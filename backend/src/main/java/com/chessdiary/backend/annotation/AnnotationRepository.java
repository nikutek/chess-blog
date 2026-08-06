package com.chessdiary.backend.annotation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

	Optional<Annotation> findByGameIdAndContextTypeAndSidelineIdAndFen(
			Long gameId, ContextType contextType, Long sidelineId, String fen);

	List<Annotation> findByGameId(Long gameId);

	void deleteBySidelineId(Long sidelineId);
}
