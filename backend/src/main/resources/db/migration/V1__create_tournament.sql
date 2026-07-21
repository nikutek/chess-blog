CREATE TABLE tournament (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    tournament_date DATE NOT NULL
);
