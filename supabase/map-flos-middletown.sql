-- Verified map pin for Flo's Clam Shack, 4 Wave Avenue, Middletown.
-- Coordinates match OpenStreetMap way 371974624.

update public.restaurants
set latitude = 41.49007,
    longitude = -71.28488
where slug = 'flos-middletown'
  and verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug = 'flos-middletown';
