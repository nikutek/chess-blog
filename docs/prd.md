## Problem Statement

The author plays chess tournaments and wants to share their games publicly with move-by-move explanations of their thought process. Currently there is no dedicated tool that lets a single author import tournament games, annotate individual moves (including the opponent's), explore alternative continuations via sidelines, and publish the result as a readable blog for other chess enthusiasts.

## Solution

A public chess blog where the author imports tournament games via PGN, annotates moves and sidelines, and publishes games for readers. Only the author can create or edit content. Readers browse tournaments, open games, and navigate through moves and sidelines on an interactive chessboard.

## User Stories

1. As the author, I want to create a Tournament, so that I can group my games by event.
2. As the author, I want to import a Game by pasting a PGN string, so that I don't have to re-enter moves manually.
3. As the author, I want every imported Game to belong to a Tournament, so that my blog is organised by event.
4. As the author, I want a Game to start as a Draft, so that I can work on annotations before anyone else sees it.
5. As the author, I want to publish a Game, so that readers can see it.
6. As the author, I want to unpublish a Game, so that I can continue editing it after publishing.
7. As the author, I want to navigate through a Game move by move on an interactive chessboard, so that I can review the game visually.
8. As the author, I want to add an Annotation to any Move in the main game (mine or the opponent's), so that I can explain my thinking or comment on the opponent's decision.
9. As the author, I want to edit or delete an existing Annotation, so that I can correct mistakes.
10. As the author, I want to create a Sideline branching off any Move in the main game, so that I can explore what might have happened differently.
11. As the author, I want to add moves to a Sideline, so that the alternative continuation is visible on the chessboard.
12. As the author, I want to add a general description to a Sideline, so that readers understand at a glance what the line is about (e.g. "leads to an open position").
13. As the author, I want to add an Annotation to any Move within a Sideline, so that I can explain each step of the alternative line in detail.
14. As the author, I want to create a Sideline that branches off another Sideline, so that I can explore nested alternatives.
15. As the author, I want to edit the moves or description of a Sideline after creating it, so that I can refine my analysis over time.
16. As the author, I want to delete a Sideline, so that I can remove analyses I no longer want to keep.
17. As the author, I want to log in with email and password, so that only I can create and edit content.
18. As the author, I want to stay logged in between sessions, so that I don't have to log in every time.
19. As a reader, I want to browse a list of Tournaments, so that I can find games from a specific event.
20. As a reader, I want to see all Published Games within a Tournament, so that I can pick a game to read.
21. As a reader, I want to navigate through a Game move by move on an interactive chessboard, so that I can follow along.
22. As a reader, I want to see the Annotation for a Move when I land on it, so that I can read the author's explanation.
23. As a reader, I want to see that a Sideline exists at a given Move, so that I know there is an alternative to explore.
24. As a reader, I want to click into a Sideline and see its general description, so that I understand what the line is about before diving in.
25. As a reader, I want to click a "play" button on a Sideline to watch its moves play out on the chessboard, so that I can see the alternative continuation visually.
26. As a reader, I want to navigate move by move inside a Sideline, so that I can study each step.
27. As a reader, I want to return to the main game from a Sideline, so that I can continue following the actual game.
28. As a reader, I want to see nested Sidelines within a Sideline, so that I can explore all levels of the author's analysis.

## Implementation Decisions

### Authentication
Supabase Auth (email/password) is the identity provider. Spring Boot verifies Supabase-issued JWTs using Supabase's public key. A single Spring Security filter extracts and verifies the JWT on every protected request. All write endpoints are protected; all read endpoints on Published content are public.

### Data model

**Tournament**: id, name, location, date.

**Game**: id, tournament_id, pgn (main line only, raw string), color (WHITE/BLACK), status (DRAFT/PUBLISHED), opponent, date.

**Annotation**: id, game_id, context_type (MAIN_LINE | SIDELINE), sideline_id (nullable), fen (position after the annotated Move), body (text). Unique constraint: (game_id, context_type, sideline_id, fen).
- Main line Move annotation: context_type=MAIN_LINE, sideline_id=null, fen=<fen>.
- Sideline Move annotation: context_type=SIDELINE, sideline_id=<id>, fen=<fen>.
- Sideline-level description: stored as a description field on the Sideline entity, not as an Annotation row.

**Sideline**: id, game_id, parent_sideline_id (nullable), branch_fen (FEN of the Move in the parent from which this Sideline begins), pgn (sideline move sequence), description (optional).

### Annotation identifier logic
Annotations are keyed by (game_id, context_type, sideline_id, fen). FEN alone is insufficient because the same position can be reached via different Sidelines and must carry independent Annotations. See ADR-0001.

### Move parsing
The main game PGN is stored as a raw string. chess.js on the frontend parses it and handles all move navigation. FEN for each position is derived client-side — the backend never computes or stores per-move FEN for the main line. Sideline moves are stored as a separate PGN snippet on the Sideline entity and parsed the same way. See ADR-0003.

### Frontend stack
Next.js (App Router), Tailwind CSS, shadcn/ui. Chessboard rendered with chess.js. All styling through Tailwind.

### Edit vs read mode
The frontend detects whether the current user is the author (via Supabase session) and renders either an editable Annotation input or a read-only display.

## Testing Decisions

Good tests verify external behaviour — what a module does, not how it does it internally. Tests should not break when you rename a private method or restructure internals.

**Auth Guard (unit tests)**: valid JWT is accepted; expired JWT returns 401; tampered JWT returns 401; missing Authorization header returns 401. No database needed.

**Annotation API (integration tests, real database)**: the composite annotation key is the most complex logic in the project. Tests verify: creating an Annotation on a main line Move and retrieving it by FEN; creating two Annotations on the same FEN in different Sidelines — both retrievable independently; updating and deleting by composite key. Use a real database (Testcontainers) — do not mock the DB layer.

**Sideline API (integration tests, real database)**: a Sideline branching from the main game has parent_sideline_id=null and correct branch_fen; a Sideline branching from another Sideline stores the correct parent_sideline_id; deleting a Sideline removes its children and their Annotations.

## Out of Scope

- PGN export (assembling main line + sidelines into a downloadable PGN file).
- Multiple authors or user roles.
- Move input via clicking the chessboard for Sidelines (v1 uses PGN text input).
- Search or filtering of games.
- Social features (reader comments, likes).
- Mobile-specific UI optimisations.

## Further Notes

- The project is a learning exercise — every non-obvious architectural decision should be explained before implementation.
- TDD (red-green-refactor) is the default approach.
- Commits: short one-liners with feat/fix/refactor prefix. No emoji, no multi-line bodies.
- New libraries outside the listed stack should be proposed and discussed before adoption.
