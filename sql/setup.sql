-- ============================================================
-- Taskly — Supabase Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Projects
create table if not exists projects (
  id text primary key,
  name text not null,
  color text not null default '#4a90d9',
  "order" integer not null default 0,
  created_at timestamptz default now()
);

-- Labels
create table if not exists labels (
  id text primary key,
  name text not null,
  color text not null default '#4a90d9',
  created_at timestamptz default now()
);

-- Filters
create table if not exists filters (
  id text primary key,
  name text not null,
  query text not null,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
  id text primary key,
  title text not null,
  notes text default '',
  due text default '',
  priority integer not null default 4,
  project_id text references projects(id) on delete set null,
  labels text[] default '{}',
  reminder text default '',
  recurrence text default '',
  subtasks jsonb default '[]',
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Row Level Security (open access via anon key for now)
alter table projects enable row level security;
alter table labels   enable row level security;
alter table filters  enable row level security;
alter table tasks    enable row level security;

-- Allow full access to anon key (no auth required)
create policy "Public access" on projects for all using (true) with check (true);
create policy "Public access" on labels   for all using (true) with check (true);
create policy "Public access" on filters  for all using (true) with check (true);
create policy "Public access" on tasks    for all using (true) with check (true);

-- Seed default projects
insert into projects (id, name, color, "order") values
  ('inbox',    'Inbox',    '#4a90d9', 0),
  ('work',     'Work',     '#8b5cf6', 1),
  ('personal', 'Personal', '#22c55e', 2)
on conflict (id) do nothing;

-- Seed default labels
insert into labels (id, name, color) values
  ('l1', 'Work',     '#4a90d9'),
  ('l2', 'Personal', '#22c55e'),
  ('l3', 'Urgent',   '#e05252')
on conflict (id) do nothing;

-- Seed default filters
insert into filters (id, name, query) values
  ('f1', 'High Priority', 'priority:1,2'),
  ('f2', 'Due This Week',  'due:week'),
  ('f3', 'No Due Date',    'no-due')
on conflict (id) do nothing;
