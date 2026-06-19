## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Game import end-to-end: the author can paste a PGN string and import a Game into an existing Tournament. The backend stores the raw PGN string (main line only). The imported Game starts with Status = Draft, visible only to the author. The Game appears in the Tournament's game list for the author.

## Acceptance criteria

- [ ] Author can import a Game by pasting a PGN string and selecting a Tournament
- [ ] Game is persisted with the raw PGN string, Color (WHITE/BLACK), opponent name, date, and Status = DRAFT
- [ ] Imported Game appears in the Tournament's game list for the author
- [ ] Draft Games are not visible to unauthenticated readers
- [ ] Importing a Game without a valid JWT returns 401
- [ ] Invalid PGN returns a clear error

## Blocked by

- #4 — Tournament management
