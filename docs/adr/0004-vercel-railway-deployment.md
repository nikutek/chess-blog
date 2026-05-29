# Vercel (Next.js) + Railway (Spring Boot) deployment

Next.js is deployed on Vercel and Spring Boot on Railway. Both platforms integrate with GitHub and provide automatic deploys on push to main — no server configuration needed. Chosen over a single VPS to eliminate DevOps overhead; the project focus is domain logic and good engineering practices, not infrastructure. Supabase is already a managed service, so this keeps all three layers (frontend, backend, database) on managed platforms with free tiers.
