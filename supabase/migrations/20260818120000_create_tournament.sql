create table tournament (
  id bigint generated always as identity primary key,
  name text not null,
  location text not null,
  tournament_date date not null
);

alter table tournament enable row level security;

-- Public read: anyone (including anonymous visitors) can list tournaments.
create policy "Tournaments are viewable by everyone"
  on tournament for select
  to anon, authenticated
  using (true);

-- Single-admin write: this blog has exactly one Supabase Auth user (the
-- author), so "authenticated" is equivalent to "the admin" here, mirroring
-- the blanket permitAll(GET) / authenticated(POST) rule in the old Spring
-- Boot SecurityConfig.
create policy "Authenticated users can create tournaments"
  on tournament for insert
  to authenticated
  with check (true);
