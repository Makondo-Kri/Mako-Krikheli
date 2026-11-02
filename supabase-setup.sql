-- Gordon Beach Run leaderboard.
-- Paste all of this into Supabase → SQL Editor → New query → Run.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  nickname    text        not null check (char_length(nickname) between 1 and 16),
  score       integer     not null check (score between 0 and 30000),
  golden      boolean     not null default false,
  lang        text        check (lang in ('he', 'en')),
  created_at  timestamptz not null default now()
);

create index if not exists scores_top_idx on public.scores (score desc, created_at);

-- Anyone may read the board and add a score; nobody can edit or delete from the website.
alter table public.scores enable row level security;

drop policy if exists "Anyone can read scores" on public.scores;
create policy "Anyone can read scores" on public.scores
  for select to anon using (true);

drop policy if exists "Anyone can add a score" on public.scores;
create policy "Anyone can add a score" on public.scores
  for insert to anon
  with check (char_length(nickname) between 1 and 16 and score between 0 and 30000);

grant select, insert on public.scores to anon;
