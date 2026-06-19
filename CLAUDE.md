# Chess Diary — zasady współpracy

## Podejście do budowy

Projekt budowany metodą **TDD** (red-green-refactor). Przy każdej nowej funkcjonalności: najpierw test, potem implementacja, potem refactor.

Priorytet: jakość i zrozumienie kodu, nie szybkość dostarczenia.

## Wyjaśnienia podczas budowy

Przed napisaniem nietrywialnego kodu — krótko wyjaśnij:
- co budujemy i dlaczego taka struktura
- jakie były alternatywy i czemu ta opcja

Cel: właściciel projektu uczy się przez budowanie go, więc decyzje architektoniczne powinny być zrozumiałe, nie tylko poprawne.

## Git

Commituj po każdej zamkniętej funkcjonalności — nie akumuluj zmian. Każdy commit powinien być jednostką sensowną sam w sobie.

Wiadomości commitów: jeden liner, prefix feat/fix/refactor mile widziany, ale bez emoji i bez wielolinijkowych opisów. Np. `feat: add sideline entity`, `fix: annotation not saving`, `refactor: extract game parser`.

## Nowe technologie

Gdy podczas budowy pojawi się okazja do użycia czegoś ciekawego spoza wylistowanego stacku — zaproponować i omówić zanim użyjemy. Nie wprowadzać nowych bibliotek/narzędzi bez rozmowy.

## Stack technologiczny

**Frontend**: Next.js, Tailwind CSS, shadcn/ui  
**Backend**: Spring Boot  
**Auth**: Supabase (JWT)  
**DB**: Supabase (Postgres)  
**Deploy**: Vercel (frontend) + Railway (backend)

Przy budowie frontu: używaj komponentów shadcn/ui zamiast pisać własne od zera. Stylowanie przez Tailwind, bez osobnych plików CSS.

## Dokumentacja domenowa

- `CONTEXT.md` — słownik domeny (Tournament, Game, Move, Annotation, Sideline, Color, Status)
- `docs/adr/` — decyzje architektoniczne; czytaj przed implementacją funkcji której dotyczą
- `MEMORY.md` — indeks ADRów i CONTEXT.md

Przed implementacją nowej funkcji: sprawdź ADRy pod kątem decyzji które jej dotyczą.
