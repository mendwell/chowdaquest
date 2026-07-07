-- Removes the July 7 map-coordinate batch because the pin locations were not
-- individually verified. Restaurant listing verification is not changed.

update public.restaurants
set latitude = null,
    longitude = null
where slug in (
  'aunt-carries',
  'champlins',
  'fieldstones',
  'flos-middletown',
  'flos-portsmouth',
  'georges',
  'iggys-warwick',
  'schultzys',
  'atlantic-grille',
  'tremblays',
  'tickets-bar-grille',
  'la-forge',
  'anthonys-seafood',
  'gulf-stream',
  'the-helmway'
);

select name, slug, latitude, longitude
from public.restaurants
where slug in (
  'aunt-carries', 'champlins', 'fieldstones', 'flos-middletown',
  'flos-portsmouth', 'georges', 'iggys-warwick', 'schultzys',
  'atlantic-grille', 'tremblays', 'tickets-bar-grille', 'la-forge',
  'anthonys-seafood', 'gulf-stream', 'the-helmway'
)
order by name;
