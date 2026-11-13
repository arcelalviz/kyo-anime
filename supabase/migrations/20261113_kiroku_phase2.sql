-- KIROKU phase 2: run in Supabase SQL Editor exactly once.
-- The public Data API can access only the signed-in user's rows.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anime fan' check (char_length(display_name) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  anime_id text not null check (char_length(anime_id) between 1 and 80),
  title text not null check (char_length(title) between 1 and 300),
  poster text check (poster is null or char_length(poster) <= 2000),
  episodes integer check (episodes is null or episodes between 0 and 9999),
  status text not null default 'planned' check (status in ('planned','watching','completed','paused','dropped')),
  progress integer not null default 0 check (progress between 0 and 9999),
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, anime_id),
  check (episodes is null or progress <= episodes)
);

create index if not exists watchlist_user_updated_idx
  on public.watchlist_entries(user_id, updated_at desc);

create or replace function public.kiroku_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kiroku_profiles_updated on public.profiles;
create trigger kiroku_profiles_updated before update on public.profiles
for each row execute function public.kiroku_set_updated_at();

drop trigger if exists kiroku_watchlist_updated on public.watchlist_entries;
create trigger kiroku_watchlist_updated before update on public.watchlist_entries
for each row execute function public.kiroku_set_updated_at();

-- Newly registered users automatically receive a private profile.
create or replace function public.kiroku_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Anime fan'), 50))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists kiroku_auth_user_created on auth.users;
create trigger kiroku_auth_user_created after insert on auth.users
for each row execute function public.kiroku_new_user();

-- Backfill profiles for users created before running this migration.
insert into public.profiles (id, display_name)
select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), 'Anime fan'), 50)
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.watchlist_entries enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.watchlist_entries from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.watchlist_entries to authenticated;

drop policy if exists kiroku_profiles_select on public.profiles;
create policy kiroku_profiles_select on public.profiles for select to authenticated
using (id = (select auth.uid()));
drop policy if exists kiroku_profiles_insert on public.profiles;
create policy kiroku_profiles_insert on public.profiles for insert to authenticated
with check (id = (select auth.uid()));
drop policy if exists kiroku_profiles_update on public.profiles;
create policy kiroku_profiles_update on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists kiroku_profiles_delete on public.profiles;
create policy kiroku_profiles_delete on public.profiles for delete to authenticated
using (id = (select auth.uid()));

drop policy if exists kiroku_watchlist_select on public.watchlist_entries;
create policy kiroku_watchlist_select on public.watchlist_entries for select to authenticated
using (user_id = (select auth.uid()));
drop policy if exists kiroku_watchlist_insert on public.watchlist_entries;
create policy kiroku_watchlist_insert on public.watchlist_entries for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists kiroku_watchlist_update on public.watchlist_entries;
create policy kiroku_watchlist_update on public.watchlist_entries for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists kiroku_watchlist_delete on public.watchlist_entries;
create policy kiroku_watchlist_delete on public.watchlist_entries for delete to authenticated
using (user_id = (select auth.uid()));
