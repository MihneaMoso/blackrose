-- ============================================================
-- RBAC Migration: profiles table, triggers, RLS policies
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. Profiles table extending auth.users
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'customer' not null,
  constraint valid_role check (role in ('customer', 'admin'))
);

-- 2. Enable RLS on profiles
alter table profiles enable row level security;

-- 3. RLS policies for profiles
-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- (No admin-write policy — the trigger handles INSERT with SECURITY DEFINER,
-- and admin profile management goes through API routes using service_role.)

-- 4. Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Enable RLS on delivery_slots
alter table delivery_slots enable row level security;

-- 6. RLS policies for delivery_slots
-- Everyone can read (customers see slots at checkout)
create policy "Public read access"
  on delivery_slots for select
  using (true);

-- Only admins can insert, update, delete
create policy "Admin write access"
  on delivery_slots for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
