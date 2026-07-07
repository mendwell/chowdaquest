-- Adds the seven restaurants requested July 7, 2026.
-- Requires verify-restaurants.sql to have been run first.
-- Safe to rerun: slug is the permanent identity and existing rows are updated.

insert into public.restaurants (
  name, slug, town, region,
  has_ri_chowder, has_ne_chowder, has_manhattan_chowder, has_clam_cakes,
  address, phone, website_url, menu_url, hours_summary,
  verification_status, verified_at, verified_source_url, verification_notes,
  photo_url, photo_alt, photo_credit, photo_source_url, photo_permission_status
)
values
  (
    'Atlantic Grille', 'atlantic-grille', 'Middletown', 'Newport County',
    false, true, false, false,
    '91 Aquidneck Avenue, Middletown, RI 02842', '401-849-4440',
    'https://www.atlanticgrille.com/', 'https://www.atlanticgrille.com/menu',
    'See official website for current hours',
    'verified', '2026-07-07T16:45:00-04:00',
    'https://www.atlanticgrille.com/',
    'Official site and menu confirmed; the current menu identifies Atlantic Grille clam chowder.',
    null, null, null, 'https://www.atlanticgrille.com/', 'pending'
  ),
  (
    'Valley Inn Restaurant', 'valley-inn-portsmouth', 'Portsmouth', 'Newport County',
    false, true, false, false,
    '2221 West Main Road, Portsmouth, RI 02871', '401-847-9871',
    'https://www.valleyinnrestaurant.net/', null,
    'Tuesday 4pm–9pm; Wednesday–Saturday 5pm–9pm; closed Sunday–Monday',
    'needs_update', '2026-07-07T16:45:00-04:00',
    'https://www.valleyinnrestaurant.net/our-story',
    'Identity and contact details are verified. New England chowder style was confirmed by the ChowdaQuest owner; a current official menu source is still needed.',
    null, null, null, 'https://www.valleyinnrestaurant.net/', 'pending'
  ),
  (
    'Tremblay''s Bar & Grill', 'tremblays', 'Portsmouth', 'Newport County',
    false, true, false, true,
    '514 Park Avenue, Portsmouth, RI 02871', '401-683-9899',
    'https://www.tremblaysbarandgrill.com/', 'https://www.tremblaysbarandgrill.com/menus/',
    'Monday–Saturday 12pm–9pm; Sunday 12pm–8pm',
    'verified', '2026-07-07T16:45:00-04:00',
    'https://www.tremblaysbarandgrill.com/location/tremblays-bar-and-grill/',
    'Official Spring 2026 menu confirms cream-style clam chowder and Portuguese clam cakes.',
    null, null, null, 'https://www.tremblaysbarandgrill.com/', 'pending'
  ),
  (
    'Tickets Bar & Grille', 'tickets-bar-grille', 'Middletown', 'Newport County',
    false, true, false, true,
    '15 Aquidneck Avenue, Middletown, RI 02842', '401-847-7678',
    'https://ticketsnewport.com/', 'https://ticketsnewport.com/menu/',
    'See official website for current hours',
    'verified', '2026-07-07T16:45:00-04:00',
    'https://ticketsnewport.com/',
    'Restaurant identity and contact details confirmed; current published menu lists New England clam chowder and clam cakes.',
    null, null, null, 'https://ticketsnewport.com/', 'pending'
  ),
  (
    'La Forge Casino Restaurant', 'la-forge', 'Newport', 'Newport County',
    false, true, false, false,
    '186 Bellevue Avenue, Newport, RI 02840', '401-847-0418',
    'https://laforgenewport.com/',
    'https://laforgenewport.com/newport-la-forge-casino-restaurant-food-menu',
    'Sunday–Thursday 11:30am–8pm; Friday–Saturday 11:30am–9pm',
    'verified', '2026-07-07T16:45:00-04:00',
    'https://laforgenewport.com/',
    'Official website confirms contact details, hours, and traditional creamy New England clam chowder.',
    null, null, null, 'https://laforgenewport.com/', 'pending'
  ),
  (
    'Portsmouth Publick House', 'portsmouth-publick-house', 'Portsmouth', 'Newport County',
    false, true, false, false,
    '1 King Charles Drive, Portsmouth, RI 02871', '401-682-2600',
    'https://www.portsmouthpublickhouse.com/', null,
    'Sunday–Thursday 11am–9pm; Friday–Saturday 11am–10pm',
    'needs_update', '2026-07-07T16:45:00-04:00',
    'https://www.visitrhodeisland.com/listing/portsmouth-publick-house/6824/',
    'New England chowder style was confirmed by the ChowdaQuest owner. Current tourism and menu listings confirm this location, but other business records still show 600 Clock Tower Square. Confirm the address directly with the restaurant.',
    null, null, null, null, 'pending'
  ),
  (
    'Anthony''s Seafood', 'anthonys-seafood', 'Middletown', 'Newport County',
    true, true, false, true,
    '963 Aquidneck Avenue, Middletown, RI 02842', '401-846-9620',
    'https://anthonysseafood.net/',
    'https://anthonysseafood.net/wp-content/uploads/2017/03/NewAnthonyMenu255.pdf',
    'Monday, Tuesday, Thursday 11am–7pm; Friday–Saturday 11am–8pm; Sunday 11:30am–7pm; closed Wednesday',
    'verified', '2026-07-07T16:55:00-04:00',
    'https://anthonysseafood.net/',
    'Official website and menu confirm broth-style Rhode Island chowder, creamy New England chowder, Portuguese fish chowder, and clam cakes.',
    null, null, null, 'https://anthonysseafood.net/', 'pending'
  )
on conflict (slug) do update set
  name = excluded.name,
  town = excluded.town,
  region = excluded.region,
  has_ri_chowder = excluded.has_ri_chowder,
  has_ne_chowder = excluded.has_ne_chowder,
  has_manhattan_chowder = excluded.has_manhattan_chowder,
  has_clam_cakes = excluded.has_clam_cakes,
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

select name, slug, town, verification_status,
       has_ri_chowder, has_ne_chowder, has_manhattan_chowder, has_clam_cakes
from public.restaurants
where slug in (
  'atlantic-grille', 'valley-inn-portsmouth', 'tremblays',
  'tickets-bar-grille', 'la-forge', 'portsmouth-publick-house',
  'anthonys-seafood'
)
order by name;
