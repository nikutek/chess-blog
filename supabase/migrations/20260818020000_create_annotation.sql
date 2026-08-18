create table annotation (
    id bigint generated always as identity primary key,
    game_id bigint not null references game (id),
    context_type text not null default 'main_line' check (context_type in ('main_line', 'sideline')),
    sideline_id bigint,
    fen varchar(100) not null,
    text text not null
);

create unique index annotation_target_idx
    on annotation (game_id, context_type, coalesce(sideline_id, -1), fen);

alter table annotation enable row level security;

-- SELECT visibility follows the parent Game's Draft/Published status, the
-- same split enforced on `game` itself (see 20260818010000_create_game.sql):
-- an anonymous reader must never see an Annotation belonging to a Draft
-- game, even if they somehow knew its id.
create policy "annotation_select_published_anon"
    on annotation
    for select
    to anon
    using (
        exists (
            select 1 from game
            where game.id = annotation.game_id
            and game.status = 'published'
        )
    );

create policy "annotation_select_all_authenticated"
    on annotation
    for select
    to authenticated
    using (true);

-- Create/update/delete are all restricted to the admin.
create policy "annotation_insert_authenticated"
    on annotation
    for insert
    to authenticated
    with check (true);

create policy "annotation_update_authenticated"
    on annotation
    for update
    to authenticated
    using (true)
    with check (true);

create policy "annotation_delete_authenticated"
    on annotation
    for delete
    to authenticated
    using (true);
