## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Game viewer end-to-end: an interactive chessboard that displays the current position, a move list sidebar, and prev/next navigation. chess.js parses the stored PGN client-side and derives positions and FEN for each move. No annotations or sidelines yet — just the ability to step through a game move by move.

## Acceptance criteria

- [ ] Game page renders an interactive chessboard showing the starting position
- [ ] Clicking next/prev advances or rewinds one Move on the chessboard
- [ ] Move list sidebar highlights the currently selected Move
- [ ] Clicking a Move in the sidebar jumps directly to that position
- [ ] FEN for each position is derived client-side by chess.js (not fetched from the backend)
- [ ] The chessboard is styled with Tailwind; no separate CSS files

## Blocked by

- #5 — Game import
