-- Verified map pins for three Newport County restaurants.
-- Coordinates come from each exact restaurant listing's directions link.

update public.restaurants as restaurant
set latitude = coordinates.latitude,
    longitude = coordinates.longitude
from (
  values
    ('fieldstones', 41.5613578, -71.2548474),
    ('gulf-stream', 41.5894640, -71.2834460),
    ('the-helmway', 41.5204483, -71.2860753)
) as coordinates(slug, latitude, longitude)
where restaurant.slug = coordinates.slug
  and restaurant.verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug in ('fieldstones', 'gulf-stream', 'the-helmway')
order by name;
