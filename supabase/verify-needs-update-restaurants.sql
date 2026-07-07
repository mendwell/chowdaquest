-- Follow-up verification audit: July 7, 2026.
-- Promotes records only when the remaining uncertainty has been resolved.

update public.restaurants
set address = '650 Succotash Road, Wakefield, RI 02879',
    verification_status = 'verified',
    verified_at = '2026-07-07T19:00:00-04:00',
    verified_source_url = 'https://rhodyoysters.com/',
    verification_notes = 'Official site confirms summer 2026 dining at the temporary tent at 650 Succotash Road while the permanent restaurant at 629 Succotash Road is rebuilt.'
where slug = 'matunuck';

update public.restaurants
set verification_status = 'verified',
    verified_at = '2026-07-07T19:00:00-04:00',
    verified_source_url = 'https://www.valleyinnrestaurant.net/our-story',
    verification_notes = 'Official site confirms the restaurant identity, address, and phone. New England chowder availability was confirmed directly by the ChowdaQuest owner.'
where slug = 'valley-inn-portsmouth';

update public.restaurants
set name = 'Blount Clam Shack & Market',
    slug = 'blount-warren-market',
    town = 'Warren',
    region = 'East Bay',
    has_ri_chowder = true,
    has_ne_chowder = true,
    has_manhattan_chowder = true,
    has_clam_cakes = true,
    has_lobster_roll = true,
    address = '406 Water Street, Warren, RI 02885',
    phone = '401-245-1800',
    website_url = 'https://blountretail.com/market/home/',
    menu_url = 'https://blountretail.com/wp-content/uploads/2025/07/Clam_Shack_Market_Menu_Summer_2026.pdf',
    hours_summary = 'Open year-round; see official website for current hours',
    verification_status = 'verified',
    verified_at = '2026-07-07T19:00:00-04:00',
    verified_source_url = 'https://blountretail.com/market/home/',
    verification_notes = 'Replaced the former Riverside listing with Blount’s current year-round Warren market and clam shack. Official site confirms location, contact details, chowders, clam cakes, and lobster rolls.',
    photo_source_url = 'https://blountretail.com/market/home/'
where slug = 'blount-riverside';

update public.restaurants
set address = '1 King Charles Drive, Portsmouth, RI 02871',
    has_ne_chowder = true,
    verification_status = 'verified',
    verified_at = '2026-07-07T19:00:00-04:00',
    verification_notes = 'Restaurant location at 1 King Charles Drive and New England chowder style were confirmed directly by the ChowdaQuest owner.'
where slug = 'portsmouth-publick-house';

update public.restaurants
set has_ri_chowder = false,
    has_ne_chowder = true,
    has_manhattan_chowder = false,
    verification_status = 'verified',
    verified_at = '2026-07-07T19:00:00-04:00',
    verified_source_url = 'https://www.ssdion.com/s/MENU-2026.pdf',
    verification_notes = 'The official 2026 dinner menu confirms quahog chowder; its New England style was confirmed directly by the ChowdaQuest owner.'
where slug = 'ss-dion';

select name, slug, address, verification_status, verification_notes
from public.restaurants
where slug in (
  'blount-warren-market',
  'matunuck',
  'valley-inn-portsmouth',
  'portsmouth-publick-house',
  'ss-dion'
)
order by name;
