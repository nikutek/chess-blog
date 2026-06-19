## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Sideline annotations end-to-end: the author can add, edit, and delete an Annotation on any Move within a Sideline. Annotations within a Sideline are keyed by (game_id, SIDELINE, sideline_id, fen), which means the same position reached via two different Sidelines carries two independent Annotations — see ADR-0001.

## Acceptance criteria

- [ ] Author sees an annotation input when viewing any Move inside a Sideline
- [ ] Author can save an Annotation; it is persisted with key (game_id, context_type=SIDELINE, sideline_id, fen)
- [ ] Author can edit and delete an Annotation within a Sideline
- [ ] Reader sees the Annotation when navigating to an annotated Move inside a Sideline
- [ ] Integration test: same FEN appears in two different Sidelines — each carries an independent Annotation and neither overwrites the other
- [ ] Integration test: Sideline annotation does not conflict with a main line Annotation at the same FEN

## Blocked by

- #9 — Sideline creation + viewer
