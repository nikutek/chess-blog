CREATE TABLE game (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL REFERENCES tournament (id),
    pgn TEXT NOT NULL,
    color VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL,
    opponent VARCHAR(255) NOT NULL,
    game_date DATE NOT NULL
);
