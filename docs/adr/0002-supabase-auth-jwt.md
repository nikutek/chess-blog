# Supabase Auth with Spring Boot JWT verification

The blog has a single admin author. We use Supabase Auth (email/password) as the identity provider instead of implementing authentication in Spring Boot. Spring Boot verifies Supabase-issued JWTs on protected endpoints using Supabase's public key. This eliminates auth boilerplate entirely — the project focuses on domain logic, not auth infrastructure.
