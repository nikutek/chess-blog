## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Implement authentication end-to-end: a login page on the frontend using Supabase Auth (email/password), and a JWT verification filter in Spring Boot that protects all write endpoints. Readers can access public content without logging in; only the author can create or modify content.

## Acceptance criteria

- [ ] Author can log in with email and password on the login page
- [ ] A valid Supabase JWT is accepted by the Spring Boot JWT filter
- [ ] An expired or tampered JWT returns 401
- [ ] A request without an Authorization header to a protected endpoint returns 401
- [ ] Public (read) endpoints return data without authentication
- [ ] Author stays logged in between page refreshes (Supabase session persisted)
- [ ] Unit tests cover the JWT filter: valid token accepted, expired rejected, tampered rejected, missing header rejected

## Blocked by

- #2 — Project scaffolding
