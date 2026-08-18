create table game (
    id bigint generated always as identity primary key,
    tournament_id bigint not null references tournament (id),
    pgn text not null,
    color text not null check (color in ('white', 'black')),
    status text not null default 'draft' check (status in ('draft', 'published')),
    opponent varchar(255) not null,
    game_date date not null
);

alter table game enable row level security;

-- This is the highest-risk policy in the app: an authenticated caller (the
-- single admin, see docs/adr/0002-supabase-auth-jwt.md) must see every Game
-- in a Tournament, while an anonymous reader must see only Published ones.
-- That split used to be enforced in GameController application code; it now
-- lives declaratively in these two role-scoped SELECT policies instead.
create policy "game_select_published_anon"
    on game
    for select
    to anon
    using (status = 'published');

create policy "game_select_all_authenticated"
    on game
    for select
    to authenticated
    using (true);

-- Import and publish/unpublish are both restricted to the admin.
create policy "game_insert_authenticated"
    on game
    for insert
    to authenticated
    with check (true);

create policy "game_update_authenticated"
    on game
    for update
    to authenticated
    using (true)
    with check (true);
