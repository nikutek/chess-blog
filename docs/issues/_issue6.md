## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Game publication end-to-end: the author can toggle a Game's Status between Draft and Published. Published Games are visible to all readers in the Tournament's public game list. Draft Games remain visible only to the author. This slice adds access control to the Game list and Game detail endpoints.

## Acceptance criteria

- [ ] Author can publish a Game (Status changes from DRAFT to PUBLISHED)
- [ ] Author can unpublish a Game (Status changes from PUBLISHED back to DRAFT)
- [ ] Published Games appear in the public Tournament game list
- [ ] Draft Games do not appear in the public Tournament game list
- [ ] Unauthenticated request to a Draft Game returns 403 or 404
- [ ] Publication toggle requires a valid JWT

## Blocked by

- #5 — Game import
