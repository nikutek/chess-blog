# Next.js Server Actions + Postgres RLS, replacing Spring Boot

The backend is rewritten from Spring Boot to Next.js, removing the separate REST API layer. Server Components and Server Actions read and write Supabase (Postgres) directly via `supabase-js`, with no ORM in between.

Authorization moves from application-level JWT verification (previously done in Spring Boot, see ADR-0002) to Postgres Row Level Security policies. Supabase issues the JWT and Postgres enforces access on every query based on it, so there is no separate layer re-checking auth — the database is the single point of enforcement.

Schema changes are managed with Supabase CLI migrations instead of Flyway, since there is no longer a Spring Boot project to host Flyway migrations, and Supabase CLI is the natural fit for a Supabase-only backend.

Deployment is Vercel-only: with no Spring Boot service to run, Railway is dropped (see ADR-0004). This also removes the cross-service deploy coordination between Vercel and Railway.

Superseded ADRs: ADR-0002 (Supabase Auth JWT verification in Spring Boot) and ADR-0004 (Vercel + Railway deployment).
