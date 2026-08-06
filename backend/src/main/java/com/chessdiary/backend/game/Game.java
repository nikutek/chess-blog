package com.chessdiary.backend.game;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.chessdiary.backend.tournament.Tournament;

@Entity
@Table(name = "game")
public class Game {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "tournament_id", nullable = false)
	private Tournament tournament;

	@Column(nullable = false)
	private String pgn;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Color color;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Status status;

	@Column(nullable = false)
	private String opponent;

	@Column(name = "game_date", nullable = false)
	private LocalDate date;

	protected Game() {
		// required by JPA
	}

	public Game(Tournament tournament, String pgn, Color color, String opponent, LocalDate date) {
		this.tournament = tournament;
		this.pgn = pgn;
		this.color = color;
		this.opponent = opponent;
		this.date = date;
		this.status = Status.DRAFT;
	}

	public void publish() {
		this.status = Status.PUBLISHED;
	}

	public void unpublish() {
		this.status = Status.DRAFT;
	}

	public Long getId() {
		return id;
	}

	public Tournament getTournament() {
		return tournament;
	}

	public String getPgn() {
		return pgn;
	}

	public Color getColor() {
		return color;
	}

	public Status getStatus() {
		return status;
	}

	public String getOpponent() {
		return opponent;
	}

	public LocalDate getDate() {
		return date;
	}
}
