## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Tournament management end-to-end: the author can create a Tournament (name, location, date) via a protected form. Readers can browse a public list of Tournaments. Every Game must belong to a Tournament, so this slice is a prerequisite for game import.

## Acceptance criteria

- [ ] Author can create a Tournament via a form (name, location, date)
- [ ] Tournament is persisted in Supabase Postgres
- [ ] Public tournament list page shows all tournaments
- [ ] Creating a tournament without a valid JWT returns 401
- [ ] Tournament list is accessible without authentication

## Blocked by

- #3 — Auth
