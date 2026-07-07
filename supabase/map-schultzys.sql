-- Verified map pin for Schultzy's Snack Shack, 346 Park Avenue, Portsmouth.
-- Coordinates come from the restaurant's official Directions link.

update public.restaurants
set latitude = 41.6223518,
    longitude = -71.2333835
where slug = 'schultzys'
  and verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug = 'schultzys';
