package com.chessdiary.backend.annotation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.chessdiary.backend.game.Game;

@Entity
@Table(name = "annotation")
public class Annotation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "game_id", nullable = false)
	private Game game;

	@Enumerated(EnumType.STRING)
	@Column(name = "context_type", nullable = false)
	private ContextType contextType;

	@Column(name = "sideline_id")
	private Long sidelineId;

	@Column(nullable = false)
	private String fen;

	@Lob
	@Column(nullable = false)
	private String text;

	protected Annotation() {
		// required by JPA
	}

	public Annotation(Game game, ContextType contextType, Long sidelineId, String fen, String text) {
		this.game = game;
		this.contextType = contextType;
		this.sidelineId = sidelineId;
		this.fen = fen;
		this.text = text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Long getId() {
		return id;
	}

	public Game getGame() {
		return game;
	}

	public ContextType getContextType() {
		return contextType;
	}

	public Long getSidelineId() {
		return sidelineId;
	}

	public String getFen() {
		return fen;
	}

	public String getText() {
		return text;
	}
}
