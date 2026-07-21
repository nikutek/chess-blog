package com.chessdiary.backend.tournament;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tournament")
public class Tournament {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String location;

	@Column(name = "tournament_date", nullable = false)
	private LocalDate date;

	protected Tournament() {
		// required by JPA
	}

	public Tournament(String name, String location, LocalDate date) {
		this.name = name;
		this.location = location;
		this.date = date;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getLocation() {
		return location;
	}

	public LocalDate getDate() {
		return date;
	}
}
