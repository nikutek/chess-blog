-- The tournament/game/annotation/sideline tables already existed in this
-- database, created by the old Spring Boot backend's Flyway migrations
-- (V1-V4) before the Railway/Spring rewrite. supabase/migrations/2026081800*
-- were written as fresh `create table` statements and don't account for
-- that pre-existing data, so they're marked as already-applied via
-- `supabase migration repair` instead of being run. This migration brings
-- the existing tables up to the state those four files describe, without
-- touching the rows that are actually in there:
--   - JPA (@Enumerated(EnumType.STRING)) wrote enum values in UPPERCASE
--     ('PUBLISHED', 'WHITE', 'MAIN_LINE'); the new stack's check constraints
--     and RLS policies assume lowercase, matching every application-layer
--     type in frontend/src/lib/*.ts. Normalize before constraining.
--   - No RLS, no policies, no check constraints, and no cascading deletes
--     existed yet (app-level auth/cascade in the old Spring code did that
--     job instead) — add them all.

update game set status = lower(status), color = lower(color);
update annotation set context_type = lower(context_type);

alter table game
    alter column status set default 'draft',
    add constraint game_status_check check (status in ('draft', 'published')),
    add constraint game_color_check check (color in ('white', 'black'));

alter table annotation
    alter column context_type set default 'main_line',
    add constraint annotation_context_type_check check (context_type in ('main_line', 'sideline'));

create unique index if not exists annotation_target_idx
    on annotation (game_id, context_type, coalesce(sideline_id, -1), fen);

-- Replace the existing non-cascading FK with one that cascades, and add the
-- annotation -> sideline FK that never existed (sideline_id was an
-- unconstrained column before).
alter table sideline drop constraint sideline_parent_sideline_id_fkey;
alter table sideline
    add constraint sideline_parent_sideline_id_fkey
    foreign key (parent_sideline_id) references sideline (id) on delete cascade;

alter table annotation
    add constraint annotation_sideline_id_fkey
    foreign key (sideline_id) references sideline (id) on delete cascade;

alter table tournament enable row level security;
alter table game enable row level security;
alter table annotation enable row level security;
alter table sideline enable row level security;

create policy "tournament_select_public" on tournament for select to anon, authenticated using (true);
create policy "tournament_insert_authenticated" on tournament for insert to authenticated with check (true);

create policy "game_select_published_anon" on game for select to anon using (status = 'published');
create policy "game_select_all_authenticated" on game for select to authenticated using (true);
create policy "game_insert_authenticated" on game for insert to authenticated with check (true);
create policy "game_update_authenticated" on game for update to authenticated using (true) with check (true);

create policy "annotation_select_published_anon" on annotation for select to anon
    using (exists (select 1 from game where game.id = annotation.game_id and game.status = 'published'));
create policy "annotation_select_all_authenticated" on annotation for select to authenticated using (true);
create policy "annotation_insert_authenticated" on annotation for insert to authenticated with check (true);
create policy "annotation_update_authenticated" on annotation for update to authenticated using (true) with check (true);
create policy "annotation_delete_authenticated" on annotation for delete to authenticated using (true);

create policy "sideline_select_published_anon" on sideline for select to anon
    using (exists (select 1 from game where game.id = sideline.game_id and game.status = 'published'));
create policy "sideline_select_all_authenticated" on sideline for select to authenticated using (true);
create policy "sideline_insert_authenticated" on sideline for insert to authenticated with check (true);
create policy "sideline_update_authenticated" on sideline for update to authenticated using (true) with check (true);
create policy "sideline_delete_authenticated" on sideline for delete to authenticated using (true);
