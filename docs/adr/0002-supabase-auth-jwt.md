# Supabase Auth with Spring Boot JWT verification

> **Superseded by [ADR-0005](./0005-nextjs-rls-supabase-architecture.md).** The Spring Boot backend was dropped; authorization is now enforced via Postgres RLS policies instead of application-level JWT verification.

The blog has a single admin author. We use Supabase Auth (email/password) as the identity provider instead of implementing authentication in Spring Boot. Spring Boot verifies Supabase-issued JWTs on protected endpoints using Supabase's public key. This eliminates auth boilerplate entirely — the project focuses on domain logic, not auth infrastructure.
