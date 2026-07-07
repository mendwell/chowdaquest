-- Verified map pin for Flo's Drive In, 324 Park Avenue, Portsmouth.
-- Coordinates are from the published directions link for this exact listing.

update public.restaurants
set latitude = 41.6221618,
    longitude = -71.2341194
where slug = 'flos-portsmouth'
  and verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug = 'flos-portsmouth';
