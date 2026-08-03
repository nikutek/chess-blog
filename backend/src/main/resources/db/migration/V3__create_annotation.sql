CREATE TABLE annotation (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES game (id),
    context_type VARCHAR(10) NOT NULL,
    sideline_id BIGINT,
    fen VARCHAR(100) NOT NULL,
    text TEXT NOT NULL
);

CREATE UNIQUE INDEX annotation_target_idx ON annotation (game_id, context_type, COALESCE(sideline_id, -1), fen);
