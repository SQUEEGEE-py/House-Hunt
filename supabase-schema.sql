-- Run this entire file in your Supabase SQL Editor
-- (Supabase Dashboard → SQL Editor → New query → paste → Run)

-- 1. Create the listings table
create table if not exists listings (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  address       text not null,
  price         integer,
  beds          integer,
  baths         numeric(3,1),
  sqft          integer,
  neighborhood  text,
  available_date date,
  url           text,
  status        text default 'new' check (status in ('new', 'tour', 'applied', 'pass')),
  notes         jsonb default '[]'::jsonb,
  votes         jsonb default '{"P1": false, "P2": false, "P3": false, "P4": false}'::jsonb
);

-- 2. Enable Row Level Security
alter table listings enable row level security;

-- 3. RLS Policies
-- Allow anyone with the anon key to read listings
create policy "Allow anon read"
  on listings for select
  using (true);

-- Allow anyone with the anon key to insert listings
create policy "Allow anon insert"
  on listings for insert
  with check (true);

-- Allow anyone with the anon key to update listings
create policy "Allow anon update"
  on listings for update
  using (true)
  with check (true);

-- Allow anyone with the anon key to delete listings
create policy "Allow anon delete"
  on listings for delete
  using (true);

-- NOTE: These policies allow any request with your anon key.
-- Security relies on keeping the anon key out of public exposure
-- and the app password gate to prevent strangers from using the key.
-- For stronger security, you could add Supabase Auth with email invites.

-- 4. Enable real-time for the listings table
-- (Supabase Dashboard → Database → Replication → enable for listings table)
-- You can also run this:
alter publication supabase_realtime add table listings;
