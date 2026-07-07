-- Adds reusable listing-verification fields and applies the July 7, 2026
-- official-source audit to every restaurant currently in ChowdaQuest.
-- Run this once in the Supabase SQL Editor. It is safe to run again.

alter table public.restaurants
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists website_url text,
  add column if not exists menu_url text,
  add column if not exists hours_summary text,
  add column if not exists verification_status text default 'unverified',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_source_url text,
  add column if not exists verification_notes text,
  add column if not exists photo_url text,
  add column if not exists photo_alt text,
  add column if not exists photo_credit text,
  add column if not exists photo_source_url text,
  add column if not exists photo_permission_status text default 'pending';

-- Photos stay on the Captain Chowder fallback until explicit reuse permission
-- or an appropriately licensed original image is recorded.
update public.restaurants
set photo_url = null,
    photo_alt = null,
    photo_credit = null,
    photo_permission_status = 'pending';

update public.restaurants set
  address = '1240 Ocean Road, Narragansett, RI 02882',
  phone = '401-783-7930',
  website_url = 'https://auntcarriesri.com/',
  menu_url = 'https://auntcarriesri.com/take-out-menu/',
  hours_summary = 'Seasonal; see official menu for current schedule',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://auntcarriesri.com/contact-us/',
  verification_notes = 'Address, phone, seasonal hours, and menu confirmed on the official website.',
  photo_source_url = 'https://auntcarriesri.com/'
where slug = 'aunt-carries';

update public.restaurants set
  address = null,
  phone = null,
  website_url = 'https://blountretail.com/',
  menu_url = null,
  hours_summary = null,
  verification_status = 'needs_update',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://blountretail.com/',
  verification_notes = 'The official site currently lists Warren locations, not a Riverside restaurant. Confirm whether this record should be replaced or archived.',
  photo_source_url = null
where slug = 'blount-riverside';

update public.restaurants set
  address = '256 Great Island Road, Narragansett, RI 02882',
  phone = '401-783-3152',
  website_url = 'https://www.champlins.com/',
  menu_url = 'https://www.champlins.com/menus?menu=menu',
  hours_summary = 'Seafood Deck opens daily at 11:30am; Fish Market daily 9am–6pm',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://www.champlins.com/',
  verification_notes = 'Contact details and opening times confirmed on the official website.',
  photo_source_url = 'https://www.champlins.com/'
where slug = 'champlins';

update public.restaurants set
  address = '980 East Main Road, Portsmouth, RI 02871',
  phone = '401-293-5200',
  website_url = 'https://www.fieldstonesgrille.com/',
  menu_url = 'https://fieldstones.popmenu.com/menus',
  hours_summary = 'See official website for current hours',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://www.fieldstonesgrille.com/',
  verification_notes = 'Identity, location, phone, and official menu confirmed.',
  photo_source_url = 'https://www.fieldstonesgrille.com/'
where slug = 'fieldstones';

update public.restaurants set
  address = '4 Wave Avenue, Middletown, RI 02840',
  phone = '401-847-8141',
  website_url = 'https://flosclamshacks.com/',
  menu_url = 'https://flosclamshacks.com/menu/',
  hours_summary = 'Monday–Sunday, 11am–9pm',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://flosclamshacks.com/locations/',
  verification_notes = 'Address, phone, hours, and menu confirmed on the official website.',
  photo_source_url = 'https://flosclamshacks.com/photo-gallery/'
where slug = 'flos-middletown';

update public.restaurants set
  address = '324 Park Avenue, Portsmouth, RI 02871',
  phone = null,
  website_url = 'https://flosclamshacks.com/',
  menu_url = 'https://flosclamshacks.com/menu/',
  hours_summary = 'Thursday–Sunday, 11am–8pm',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://flosclamshacks.com/locations/',
  verification_notes = 'The official page identifies the site as Park Avenue at Island Beach Park and gives 324 Park Avenue in its contact block; no location phone is published.',
  photo_source_url = 'https://flosclamshacks.com/photo-gallery/'
where slug = 'flos-portsmouth';

update public.restaurants set
  address = '250 Sand Hill Cove Road, Narragansett, RI 02882',
  phone = '401-783-2306',
  website_url = 'https://www.georgesofgalilee.com/',
  menu_url = 'https://www.georgesofgalilee.com/menu/',
  hours_summary = 'Sunday–Thursday 11am–9pm; Friday–Saturday 11am–10pm',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://www.georgesofgalilee.com/',
  verification_notes = 'Address, phone, hours, and menu confirmed on the official website.',
  photo_source_url = 'https://www.georgesofgalilee.com/'
where slug = 'georges';

update public.restaurants set
  address = '889 Oakland Beach Avenue, Warwick, RI 02889',
  phone = '401-737-9459',
  website_url = 'https://iggysri.com/',
  menu_url = 'https://iggysri.com/locations/warwick/',
  hours_summary = 'Open Monday–Sunday at 11am',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://iggysri.com/locations/warwick/',
  verification_notes = 'Address, phone, opening time, and Warwick menu link confirmed on the official location page.',
  photo_source_url = 'https://iggysri.com/locations/warwick/'
where slug = 'iggys-warwick';

update public.restaurants set
  address = '629 Succotash Road, Wakefield, RI 02879',
  phone = '401-783-4202',
  website_url = 'https://rhodyoysters.com/',
  menu_url = 'https://rhodyoysters.com/wp-content/uploads/mob-dinner-menu-web.pdf',
  hours_summary = 'Sunday–Thursday 11am–9pm; Friday–Saturday 11am–10pm',
  verification_status = 'needs_update',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://rhodyoysters.com/',
  verification_notes = 'The official site lists 629 Succotash Road for the restaurant but currently directs seasonal tent dining to 650 Succotash Road during rebuilding. Confirm the correct visitor address before marking verified.',
  photo_source_url = 'https://rhodyoysters.com/'
where slug = 'matunuck';

update public.restaurants set
  address = '346 Park Avenue, Portsmouth, RI 02871',
  phone = '401-683-2663',
  website_url = 'https://schultzyssnackshack.com/',
  menu_url = 'https://schultzyssnackshack.com/food-menu/',
  hours_summary = 'Seasonal; see official website for current schedule',
  verification_status = 'verified',
  verified_at = '2026-07-07T12:00:00-04:00',
  verified_source_url = 'https://schultzyssnackshack.com/contact-us/',
  verification_notes = 'Address, phone, and official food menu confirmed on the restaurant website; operating schedule is seasonal.',
  photo_source_url = 'https://schultzyssnackshack.com/photo-gallery/'
where slug = 'schultzys';

-- Quick audit: every current row should now have a workflow status.
select name, slug, verification_status, verified_at, verified_source_url,
       photo_permission_status
from public.restaurants
order by name;
