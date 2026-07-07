-- Exact map coordinates for the five restaurants verified July 7, 2026.
-- Restaurant coordinates use published map destinations. Matunuck uses the
-- temporary summer dining parcel at 650 Succotash Road, not the former building.

update public.restaurants as restaurant
set latitude = coordinates.latitude,
    longitude = coordinates.longitude
from (
  values
    ('blount-warren-market', 41.72670030, -71.28463930),
    ('matunuck', 41.38572630, -71.52588800),
    ('valley-inn-portsmouth', 41.56319170, -71.28623890),
    ('portsmouth-publick-house', 41.59108010, -71.26738790),
    ('ss-dion', 41.67454680, -71.27872310)
) as coordinates(slug, latitude, longitude)
where restaurant.slug = coordinates.slug
  and restaurant.verification_status = 'verified';

select name, slug, address, latitude, longitude
from public.restaurants
where slug in (
  'blount-warren-market',
  'matunuck',
  'valley-inn-portsmouth',
  'portsmouth-publick-house',
  'ss-dion'
)
order by name;
