# Memory Index

- [CONTEXT.md](./CONTEXT.md) — domain glossary: Tournament, Game, Move, Annotation, Color, Status
- [ADR-0001: Annotation identifier model](./docs/adr/0001-fen-as-annotation-identifier.md) — FEN for main line, (sideline_id+FEN) for sideline moves, sideline_id for sideline descriptions
- [ADR-0002: Supabase Auth + Spring Boot JWT](./docs/adr/0002-supabase-auth-jwt.md) — single-admin auth via Supabase (superseded by ADR-0005)
- [ADR-0003: PGN source of truth + Sidelines as separate entities](./docs/adr/0003-pgn-source-of-truth-client-side-parsing.md) — main line in PGN, each Sideline stored separately with own ID
- [ADR-0004: Vercel + Railway deployment](./docs/adr/0004-vercel-railway-deployment.md) — Next.js on Vercel, Spring Boot on Railway, auto-deploy from GitHub (superseded by ADR-0005)
- [ADR-0005: Next.js/RLS/Supabase-CLI architecture](./docs/adr/0005-nextjs-rls-supabase-architecture.md) — Next.js Server Actions replace Spring Boot, Postgres RLS for authz, no ORM, Supabase CLI migrations, Vercel-only deploy
