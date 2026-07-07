-- Final verified restaurant map pins.
-- Coordinates come from each restaurant's published map destination.

update public.restaurants as restaurant
set latitude = coordinates.latitude,
    longitude = coordinates.longitude
from (
  values
    ('georges', 41.37642790, -71.51250520),
    ('iggys-warwick', 41.68451280, -71.39801670),
    ('tremblays', 41.62364240, -71.22753760)
) as coordinates(slug, latitude, longitude)
where restaurant.slug = coordinates.slug
  and restaurant.verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug in ('georges', 'iggys-warwick', 'tremblays')
order by name;
