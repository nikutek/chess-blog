create table sideline (
    id bigint generated always as identity primary key,
    game_id bigint not null references game (id),
    parent_sideline_id bigint references sideline (id) on delete cascade,
    branch_fen varchar(100) not null,
    pgn text not null,
    description text
);

alter table sideline enable row level security;

-- SELECT visibility follows the parent Game's Draft/Published status, same
-- split as `game` and `annotation` (see 20260818010000_create_game.sql and
-- 20260818020000_create_annotation.sql): an anonymous reader must never see
-- a Sideline belonging to a Draft game.
create policy "sideline_select_published_anon"
    on sideline
    for select
    to anon
    using (
        exists (
            select 1 from game
            where game.id = sideline.game_id
            and game.status = 'published'
        )
    );

create policy "sideline_select_all_authenticated"
    on sideline
    for select
    to authenticated
    using (true);

-- Create/update/delete are all restricted to the admin.
create policy "sideline_insert_authenticated"
    on sideline
    for insert
    to authenticated
    with check (true);

create policy "sideline_update_authenticated"
    on sideline
    for update
    to authenticated
    using (true)
    with check (true);

create policy "sideline_delete_authenticated"
    on sideline
    for delete
    to authenticated
    using (true);

-- The `sideline` table didn't exist when `annotation` was created, so its FK
-- is added here now that it does. ON DELETE CASCADE replaces the Spring
-- backend's app-level `SidelineController.deleteCascading`: deleting a
-- Sideline (and, transitively, its descendant Sidelines via the
-- self-referencing FK above) now also removes its Annotations at the
-- database level.
alter table annotation
    add constraint annotation_sideline_id_fkey
    foreign key (sideline_id) references sideline (id) on delete cascade;
