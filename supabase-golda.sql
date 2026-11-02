-- Golda's Kitchen leaderboard (run once, in Supabase → SQL Editor → New query → Run).
create table if not exists public.golda_scores (
  id          bigint generated always as identity primary key,
  nickname    text        not null check (char_length(nickname) between 1 and 16),
  score       integer     not null check (score between 0 and 30000),
  golden      boolean     not null default false,
  lang        text        check (lang in ('he', 'en')),
  created_at  timestamptz not null default now()
);

create index if not exists golda_scores_top_idx on public.golda_scores (score desc, created_at);

alter table public.golda_scores enable row level security;

drop policy if exists "Anyone can read scores" on public.golda_scores;
create policy "Anyone can read scores" on public.golda_scores
  for select to anon using (true);

drop policy if exists "Anyone can add a score" on public.golda_scores;
create policy "Anyone can add a score" on public.golda_scores
  for insert to anon
  with check (char_length(nickname) between 1 and 16 and score between 0 and 30000);

grant select, insert on public.golda_scores to anon;
