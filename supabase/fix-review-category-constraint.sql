-- Expands the reviewable food categories to match the live app.
-- Run once in the Supabase SQL Editor. Safe to run again.

alter table public.restaurants
  add column if not exists has_stuffies boolean not null default false;

alter table public.reviews
  drop constraint if exists reviews_category_check;

alter table public.reviews
  add constraint reviews_category_check
  check (category in ('ri', 'ne', 'manhattan', 'cakes', 'lobster', 'stuffies'))
  not valid;

do $$
begin
  if to_regclass('public.restaurant_suggestions') is not null then
    alter table public.restaurant_suggestions
      drop constraint if exists restaurant_suggestions_suggested_category_check;

    alter table public.restaurant_suggestions
      add constraint restaurant_suggestions_suggested_category_check
      check (suggested_category in ('ri', 'ne', 'manhattan', 'cakes', 'lobster', 'stuffies'))
      not valid;
  end if;
end;
$$;

-- Optional verification query: shows any historical rows that do not match
-- the current app categories. New inserts are protected by the check above.
select id, category, created_at
from public.reviews
where category is not null
  and category not in ('ri', 'ne', 'manhattan', 'cakes', 'lobster', 'stuffies')
order by created_at desc;
