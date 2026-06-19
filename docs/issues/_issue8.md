## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Sideline creation and viewer end-to-end: the author can create a Sideline branching off any Move in the main game by providing a PGN snippet and an optional general description. A sideline indicator appears at the branch point in the game viewer. Readers can click into the Sideline, read its description, use the "play" button to watch the moves play out on the chessboard, and navigate move by move. They can also return to the main game.

Each Sideline is stored as a separate entity with its own id, branch_fen (the FEN of the main line Move it branches from), pgn snippet, and optional description — see ADR-0003.

## Acceptance criteria

- [ ] Author can create a Sideline on any Move by entering a PGN snippet and optional description
- [ ] Sideline is persisted with its own id, game_id, branch_fen, pgn, and description
- [ ] A sideline indicator is visible at the branch point Move in the game viewer
- [ ] Clicking the indicator enters the Sideline and shows its description
- [ ] "Play" button plays the Sideline moves on the chessboard automatically
- [ ] Reader can navigate the Sideline move by move (prev/next)
- [ ] Reader can return to the main game from a Sideline
- [ ] Author can edit the PGN or description of an existing Sideline
- [ ] Author can delete a Sideline
- [ ] Integration tests: create sideline, retrieve by id, verify branch_fen stored correctly

## Blocked by

- #6 — Game viewer
