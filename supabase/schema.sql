-- =============================================================================
-- Pulse — AI Creator Growth Coach
-- Full database schema. Run this once in the Supabase SQL editor.
-- Safe to re-run: every object is created with IF NOT EXISTS / OR REPLACE.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type platform as enum ('tiktok', 'instagram');
exception when duplicate_object then null; end $$;

do $$ begin
  create type main_platform as enum ('tiktok', 'instagram', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type video_format as enum (
    'talking_head', 'voiceover_broll', 'screen_recording', 'text_on_screen',
    'skit', 'tutorial', 'vlog', 'interview', 'photo_carousel'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('free', 'creator_pro', 'agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recommendation_status as enum ('new', 'posted', 'skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_outcome as enum ('posted', 'skipped', 'successful', 'underperformed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type competition_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- users — a public mirror of auth.users so app tables can reference a row we own
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Application-visible mirror of auth.users.';

-- Keep the mirror in sync with auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Backfill anyone who signed up before this trigger existed.
insert into public.users (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- creator_profiles — one per user
-- -----------------------------------------------------------------------------
create table if not exists public.creator_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.users (id) on delete cascade,
  display_name         text not null,
  niche                text not null,
  main_platform        main_platform not null default 'tiktok',
  instagram_username   text,
  tiktok_username      text,
  audience_country     text,
  content_language     text not null default 'en',
  plan                 plan_tier not null default 'free',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists creator_profiles_user_id_idx on public.creator_profiles (user_id);

-- -----------------------------------------------------------------------------
-- videos — the performance history Pulse learns from
-- -----------------------------------------------------------------------------
create table if not exists public.videos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  platform         platform not null,
  title            text not null,
  hook             text not null,
  topic            text not null,
  format           video_format not null,
  views            integer not null default 0 check (views >= 0),
  likes            integer not null default 0 check (likes >= 0),
  comments         integer not null default 0 check (comments >= 0),
  shares           integer not null default 0 check (shares >= 0),
  saves            integer not null default 0 check (saves >= 0),
  duration_seconds integer not null check (duration_seconds > 0 and duration_seconds <= 3600),
  posted_at        timestamptz not null,
  created_at       timestamptz not null default now(),
  -- Engagement rate as a percentage of views. Stored so we can sort on it.
  engagement_rate  numeric(6, 2) generated always as (
    case when views > 0
      then round(((likes + comments + shares + saves)::numeric / views) * 100, 2)
      else 0
    end
  ) stored
);

create index if not exists videos_user_posted_idx on public.videos (user_id, posted_at desc);
create index if not exists videos_user_views_idx  on public.videos (user_id, views desc);

-- -----------------------------------------------------------------------------
-- recommendations — what Pulse told the creator to post
-- -----------------------------------------------------------------------------
create table if not exists public.recommendations (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.users (id) on delete cascade,
  hook                      text not null,
  concept                   text not null,
  suggested_duration_seconds integer not null check (suggested_duration_seconds > 0),
  format                    video_format not null,
  cta                       text not null,
  caption_idea              text not null,
  reasoning                 text not null,
  predicted_score           integer not null check (predicted_score between 0 and 100),
  status                    recommendation_status not null default 'new',
  generated_for             date not null default current_date,
  model                     text,
  created_at                timestamptz not null default now()
);

create index if not exists recommendations_user_created_idx on public.recommendations (user_id, created_at desc);
create index if not exists recommendations_user_day_idx     on public.recommendations (user_id, generated_for desc);

-- -----------------------------------------------------------------------------
-- recommendation_feedback — the loop that makes the next batch smarter
-- -----------------------------------------------------------------------------
create table if not exists public.recommendation_feedback (
  id                uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  user_id           uuid not null references public.users (id) on delete cascade,
  outcome           feedback_outcome not null,
  note              text,
  actual_views      integer check (actual_views >= 0),
  created_at        timestamptz not null default now(),
  unique (recommendation_id, outcome)
);

create index if not exists recommendation_feedback_user_idx on public.recommendation_feedback (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- trends — Viral Radar source data (shared, read-only for users)
-- -----------------------------------------------------------------------------
create table if not exists public.trends (
  id                uuid primary key default gen_random_uuid(),
  topic             text not null,
  format            video_format not null,
  velocity_score    integer not null check (velocity_score between 0 and 100),
  trend_age_days    integer not null check (trend_age_days >= 0),
  competition_level competition_level not null,
  niche             text,
  platform          platform,
  angle_template    text not null,
  source            text not null default 'seed',
  captured_at       timestamptz not null default now()
);

create index if not exists trends_velocity_idx on public.trends (velocity_score desc);
create index if not exists trends_niche_idx    on public.trends (niche);

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists creator_profiles_touch on public.creator_profiles;
create trigger creator_profiles_touch
  before update on public.creator_profiles
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
-- Every table is owner-scoped except `trends`, which is shared read-only.
-- =============================================================================
alter table public.users                   enable row level security;
alter table public.creator_profiles        enable row level security;
alter table public.videos                  enable row level security;
alter table public.recommendations         enable row level security;
alter table public.recommendation_feedback enable row level security;
alter table public.trends                  enable row level security;

-- users ------------------------------------------------------------------
drop policy if exists "users read own" on public.users;
create policy "users read own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- creator_profiles -------------------------------------------------------
drop policy if exists "profiles read own" on public.creator_profiles;
create policy "profiles read own" on public.creator_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles insert own" on public.creator_profiles;
create policy "profiles insert own" on public.creator_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles update own" on public.creator_profiles;
create policy "profiles update own" on public.creator_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "profiles delete own" on public.creator_profiles;
create policy "profiles delete own" on public.creator_profiles
  for delete using (auth.uid() = user_id);

-- videos -----------------------------------------------------------------
drop policy if exists "videos read own" on public.videos;
create policy "videos read own" on public.videos
  for select using (auth.uid() = user_id);

drop policy if exists "videos insert own" on public.videos;
create policy "videos insert own" on public.videos
  for insert with check (auth.uid() = user_id);

drop policy if exists "videos update own" on public.videos;
create policy "videos update own" on public.videos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "videos delete own" on public.videos;
create policy "videos delete own" on public.videos
  for delete using (auth.uid() = user_id);

-- recommendations --------------------------------------------------------
drop policy if exists "recs read own" on public.recommendations;
create policy "recs read own" on public.recommendations
  for select using (auth.uid() = user_id);

drop policy if exists "recs insert own" on public.recommendations;
create policy "recs insert own" on public.recommendations
  for insert with check (auth.uid() = user_id);

drop policy if exists "recs update own" on public.recommendations;
create policy "recs update own" on public.recommendations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recs delete own" on public.recommendations;
create policy "recs delete own" on public.recommendations
  for delete using (auth.uid() = user_id);

-- recommendation_feedback ------------------------------------------------
drop policy if exists "feedback read own" on public.recommendation_feedback;
create policy "feedback read own" on public.recommendation_feedback
  for select using (auth.uid() = user_id);

drop policy if exists "feedback insert own" on public.recommendation_feedback;
create policy "feedback insert own" on public.recommendation_feedback
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and r.user_id = auth.uid()
    )
  );

drop policy if exists "feedback delete own" on public.recommendation_feedback;
create policy "feedback delete own" on public.recommendation_feedback
  for delete using (auth.uid() = user_id);

-- trends -----------------------------------------------------------------
drop policy if exists "trends readable by signed-in users" on public.trends;
create policy "trends readable by signed-in users" on public.trends
  for select to authenticated using (true);
-- Writes to `trends` are intentionally left to the service role only
-- (the ingestion job in src/lib/trends/provider.ts).
