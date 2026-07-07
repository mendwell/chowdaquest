-- Verified map pins for three Middletown restaurants.
-- Coordinates come from each exact restaurant listing's directions link.

update public.restaurants as restaurant
set latitude = coordinates.latitude,
    longitude = coordinates.longitude
from (
  values
    ('atlantic-grille', 41.4921535, -71.2839162),
    ('tickets-bar-grille', 41.4898840, -71.2841770),
    ('anthonys-seafood', 41.5142900, -71.2819580)
) as coordinates(slug, latitude, longitude)
where restaurant.slug = coordinates.slug
  and restaurant.verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug in ('atlantic-grille', 'tickets-bar-grille', 'anthonys-seafood')
order by name;
