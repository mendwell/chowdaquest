-- Reject clearly offensive or explicit language at the database boundary.
-- Run this once in the Supabase SQL Editor after reviewing the blocked terms.

create or replace function public.cq_contains_blocked_language(input_text text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select regexp_replace(
    lower(translate(coalesce(input_text, ''), '013457@$!', 'oieastasi')),
    '[^a-z0-9]+',
    ' ',
    'g'
  ) ~ '(^| )(f[ua]ck(ed|ing|er|s)?|shit(ty|head|s)?|bitch(es|y)?|cunts?|motherf[ua]ckers?|faggots?|nigg(ers?|as?)|kikes?|spics?|chinks?)($| )';
$$;

create or replace function public.cq_reject_blocked_review_language()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.cq_contains_blocked_language(new.reviewer_name)
    or public.cq_contains_blocked_language(new.comments) then
    raise exception using
      errcode = '23514',
      message = 'Please revise this review to remove offensive or explicit language.';
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_reject_blocked_language on public.reviews;
create trigger reviews_reject_blocked_language
before insert or update of reviewer_name, comments
on public.reviews
for each row
execute function public.cq_reject_blocked_review_language();

create or replace function public.cq_reject_blocked_suggestion_language()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.cq_contains_blocked_language(new.name)
    or public.cq_contains_blocked_language(new.town)
    or public.cq_contains_blocked_language(new.suggested_by)
    or public.cq_contains_blocked_language(new.notes) then
    raise exception using
      errcode = '23514',
      message = 'Please revise this suggestion to remove offensive or explicit language.';
  end if;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.restaurant_suggestions') is not null then
    execute 'drop trigger if exists suggestions_reject_blocked_language on public.restaurant_suggestions';
    execute 'create trigger suggestions_reject_blocked_language
      before insert or update of name, town, suggested_by, notes
      on public.restaurant_suggestions
      for each row
      execute function public.cq_reject_blocked_suggestion_language()';
  end if;
end;
$$;
