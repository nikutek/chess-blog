CREATE TABLE sideline (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES game (id),
    parent_sideline_id BIGINT REFERENCES sideline (id),
    branch_fen VARCHAR(100) NOT NULL,
    pgn TEXT NOT NULL,
    description TEXT
);
