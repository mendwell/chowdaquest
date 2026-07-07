-- Verified map pins for three coastal Rhode Island restaurants.
-- Coordinates come from each exact restaurant listing's directions link.

update public.restaurants as restaurant
set latitude = coordinates.latitude,
    longitude = coordinates.longitude
from (
  values
    ('la-forge', 41.4829610, -71.3082537),
    ('champlins', 41.3771789, -71.5127470),
    ('aunt-carries', 41.3728364, -71.4849884)
) as coordinates(slug, latitude, longitude)
where restaurant.slug = coordinates.slug
  and restaurant.verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug in ('la-forge', 'champlins', 'aunt-carries')
order by name;
