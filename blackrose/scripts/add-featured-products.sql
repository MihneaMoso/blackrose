-- ============================================================
-- Migration: Add featured & offer_text columns to products
-- Run this in your Supabase SQL Editor
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'featured'
  ) then
    alter table products add column featured boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'products' and column_name = 'offer_text'
  ) then
    alter table products add column offer_text text;
  end if;
end $$;
