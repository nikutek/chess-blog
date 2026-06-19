## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Main line annotations end-to-end: the author can add, edit, and delete an Annotation on any Move in the main game (own or opponent's). When a reader lands on an annotated Move, the Annotation text is displayed. Annotations are keyed by (game_id, MAIN_LINE, fen) — see ADR-0001.

## Acceptance criteria

- [ ] Author sees an annotation input when viewing any Move in the main game
- [ ] Author can save an Annotation; it is persisted with key (game_id, context_type=MAIN_LINE, sideline_id=null, fen)
- [ ] Author can edit an existing Annotation on a Move
- [ ] Author can delete an Annotation on a Move
- [ ] Reader sees the Annotation text when navigating to an annotated Move
- [ ] Reader sees nothing (no input) on unannotated Moves
- [ ] Integration tests: create annotation, retrieve by FEN, update, delete — all against a real database

## Blocked by

- #6 — Game viewer
