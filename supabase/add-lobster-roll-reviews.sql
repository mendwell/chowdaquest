-- Adds lobster-roll eligibility and preparation data for reviews.
-- Run once in the Supabase SQL Editor. Safe to run again.

alter table public.restaurants
  add column if not exists has_lobster_roll boolean not null default false;

alter table public.reviews
  add column if not exists preparation text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_lobster_preparation_check'
  ) then
    alter table public.reviews
      add constraint reviews_lobster_preparation_check
      check (preparation is null or preparation in ('cold_mayo', 'hot_butter'));
  end if;
end $$;

update public.restaurants
set has_lobster_roll = slug in (
  'anthonys-seafood',
  'aunt-carries',
  'champlins',
  'fieldstones',
  'flos-middletown',
  'flos-portsmouth',
  'georges',
  'gulf-stream',
  'iggys-warwick',
  'la-forge',
  'tickets-bar-grille'
);

insert into public.restaurants (
  name, slug, town, region,
  has_ri_chowder, has_ne_chowder, has_manhattan_chowder, has_clam_cakes, has_lobster_roll,
  address, phone, website_url, menu_url, hours_summary,
  verification_status, verified_at, verified_source_url, verification_notes,
  photo_url, photo_alt, photo_credit, photo_source_url, photo_permission_status
)
values
  (
    'S.S. Dion Kitchen + Bar', 'ss-dion', 'Bristol', 'East Bay',
    false, false, false, false, false,
    '520 Thames Street, Bristol, RI 02809', '401-253-2884',
    'https://www.ssdion.com/',
    'https://www.ssdion.com/s/MENU-2026.pdf',
    'Tuesday–Thursday 4pm–9pm; Friday–Saturday 4pm–10pm; closed Sunday–Monday',
    'needs_update', '2026-07-07T18:00:00-04:00',
    'https://www.ssdion.com/',
    'The official 2026 menu confirms quahog chowder but does not identify its style. Assign a ChowdaQuest category after direct confirmation.',
    null, null, null, 'https://www.ssdion.com/', 'pending'
  ),
  (
    'The Gulf Stream Bar & Grille', 'gulf-stream', 'Portsmouth', 'Newport County',
    false, true, false, false, true,
    '1 Lagoon Road, Portsmouth, RI 02871', '401-293-0930',
    'https://www.gulfstreambar.com/', 'https://www.gulfstreambar.com/menu',
    'See official website for current hours',
    'verified', '2026-07-07T18:00:00-04:00',
    'https://www.gulfstreambar.com/menu',
    'Official menu confirms New England clam chowder; lobster-roll availability was additionally confirmed by the ChowdaQuest owner.',
    null, null, null, 'https://www.gulfstreambar.com/', 'pending'
  ),
  (
    'The Helmway', 'the-helmway', 'Middletown', 'Newport County',
    false, true, false, false, false,
    '425 East Main Road, Middletown, RI 02842', '401-214-1413',
    'https://www.thehelmway.com/', 'https://www.thehelmway.com/dinner',
    'Breakfast daily 7am–10:30am; lunch Saturday–Sunday 11am–2pm; dinner daily 4pm–9pm',
    'verified', '2026-07-07T18:00:00-04:00',
    'https://www.thehelmway.com/about',
    'Official current dinner menu confirms New England-style Helmway Chowder.',
    null, null, null, 'https://www.thehelmway.com/', 'pending'
  )
on conflict (slug) do update set
  name = excluded.name,
  town = excluded.town,
  region = excluded.region,
  has_ri_chowder = excluded.has_ri_chowder,
  has_ne_chowder = excluded.has_ne_chowder,
  has_manhattan_chowder = excluded.has_manhattan_chowder,
  has_clam_cakes = excluded.has_clam_cakes,
  has_lobster_roll = excluded.has_lobster_roll,
  address = excluded.address,
  phone = excluded.phone,
  website_url = excluded.website_url,
  menu_url = excluded.menu_url,
  hours_summary = excluded.hours_summary,
  verification_status = excluded.verification_status,
  verified_at = excluded.verified_at,
  verified_source_url = excluded.verified_source_url,
  verification_notes = excluded.verification_notes,
  photo_source_url = excluded.photo_source_url,
  photo_permission_status = excluded.photo_permission_status;

update public.restaurants
set has_lobster_roll = true
where slug in ('fieldstones', 'gulf-stream');

select name, slug, has_lobster_roll
from public.restaurants
where has_lobster_roll
order by name;
