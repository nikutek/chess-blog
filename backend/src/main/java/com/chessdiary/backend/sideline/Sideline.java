package com.chessdiary.backend.sideline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.chessdiary.backend.game.Game;

@Entity
@Table(name = "sideline")
public class Sideline {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "game_id", nullable = false)
	private Game game;

	@Column(name = "parent_sideline_id")
	private Long parentSidelineId;

	@Column(name = "branch_fen", nullable = false)
	private String branchFen;

	@Lob
	@Column(nullable = false)
	private String pgn;

	@Column
	private String description;

	protected Sideline() {
		// required by JPA
	}

	public Sideline(Game game, Long parentSidelineId, String branchFen, String pgn, String description) {
		this.game = game;
		this.parentSidelineId = parentSidelineId;
		this.branchFen = branchFen;
		this.pgn = pgn;
		this.description = description;
	}

	public void update(String pgn, String description) {
		this.pgn = pgn;
		this.description = description;
	}

	public Long getId() {
		return id;
	}

	public Game getGame() {
		return game;
	}

	public Long getParentSidelineId() {
		return parentSidelineId;
	}

	public String getBranchFen() {
		return branchFen;
	}

	public String getPgn() {
		return pgn;
	}

	public String getDescription() {
		return description;
	}
}
