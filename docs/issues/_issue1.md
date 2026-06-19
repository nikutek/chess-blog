## Parent

#1 — PRD: Chess Diary — build plan

## What to build

Set up the project skeleton end-to-end so that every subsequent slice has a running foundation to build on. This includes a Spring Boot backend connected to Supabase (Postgres), a Next.js frontend with Tailwind and shadcn/ui, and both deployed automatically to Railway (backend) and Vercel (frontend) on every push to main.

This is a HITL slice — before starting, decisions to make together: monorepo vs separate repositories for frontend and backend, folder structure, and how environment variables (Supabase URL, anon key, JWT secret) are managed across local dev and production.

## Acceptance criteria

- [ ] Spring Boot application starts and can reach Supabase Postgres (health endpoint returns 200)
- [ ] Next.js application starts and renders a placeholder home page with Tailwind styles applied
- [ ] shadcn/ui is installed and at least one component (e.g. Button) renders on the page
- [ ] Push to main triggers automatic deploy on both Railway and Vercel
- [ ] Environment variables are configured in Railway and Vercel (not committed to git)

## Blocked by

None — can start immediately.
