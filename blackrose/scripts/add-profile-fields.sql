-- Add profile fields for user info
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists address text;

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
