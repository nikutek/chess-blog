## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Nested sidelines end-to-end: the author can create a Sideline that branches off a Move inside another Sideline (not just the main game). The nested Sideline stores a parent_sideline_id pointing to its parent Sideline and the branch_fen of the Move it branches from. The game viewer shows nested Sideline indicators and allows the reader to navigate into them. Deleting a parent Sideline also removes all its nested Sidelines and their Annotations.

## Acceptance criteria

- [ ] Author can create a Sideline branching from a Move inside an existing Sideline
- [ ] Nested Sideline is persisted with parent_sideline_id and branch_fen correctly set
- [ ] Nested Sideline indicator is visible at the branch point while navigating the parent Sideline
- [ ] Reader can enter the nested Sideline, navigate it move by move, and return to the parent Sideline
- [ ] Deleting a Sideline cascades: its child Sidelines and all associated Annotations are also deleted
- [ ] Integration tests: create a two-level deep Sideline tree, verify parent_sideline_id chain, verify cascade delete

## Blocked by

- #9 — Sideline creation + viewer
