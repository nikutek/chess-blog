create table tournament (
    id bigint generated always as identity primary key,
    name varchar(255) not null,
    location varchar(255) not null,
    tournament_date date not null
);

alter table tournament enable row level security;

-- Public read: anyone (including unauthenticated visitors) can list tournaments.
create policy "tournament_select_public"
    on tournament
    for select
    to anon, authenticated
    using (true);

-- Write restricted to the signed-in admin. This blog has exactly one Supabase
-- Auth user (the author, see docs/adr/0002-supabase-auth-jwt.md), so
-- "authenticated" is equivalent to "admin" here.
create policy "tournament_insert_authenticated"
    on tournament
    for insert
    to authenticated
    with check (true);
