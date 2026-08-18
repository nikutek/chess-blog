# Next.js Server Actions + Postgres RLS replace Spring Boot backend

Supersedes [ADR-0002](./0002-supabase-auth-jwt.md) and [ADR-0004](./0004-vercel-railway-deployment.md).

The Spring Boot REST API is dropped. Next.js Server Components and Server Actions talk to Supabase directly via `supabase-js`, with no ORM layer in between — the database schema is the data model, and Supabase's generated types keep queries type-safe.

Authorization moves from application-level JWT verification (a Spring Boot filter checking Supabase-issued JWTs, per ADR-0002) to Postgres Row Level Security policies. Since the blog has a single admin author, the policies are simple: public read access on published content, write access restricted to the authenticated admin user. This removes an entire application layer whose only job was enforcing rules the database can enforce natively, and it means authorization can't be bypassed by a bug in a Server Action — it's enforced at the data layer regardless of which code path reaches it.

Schema changes are managed with Supabase CLI migrations instead of Flyway. Flyway was tied to the Spring Boot project; the Supabase CLI is the natural fit for a Postgres-as-a-service setup and keeps migrations versioned alongside the rest of the Supabase configuration.

Deployment is Vercel-only. With no Spring Boot service left to host, Railway (ADR-0004) is dropped — Next.js on Vercel and Supabase (already managed) are the only two platforms left, both with automatic deploys from GitHub.

This was rejected as unnecessary complexity for the project's actual scope: a single-admin blog does not need a separate backend service, and maintaining one (REST endpoints, JWT verification, an ORM, a second deployment target) was infrastructure overhead disproportionate to the domain logic it served.
