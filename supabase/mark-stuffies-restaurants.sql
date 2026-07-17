-- Marks restaurants with confirmed Stuffies / stuffed quahogs availability.
-- Run after fix-review-category-constraint.sql has added has_stuffies.
-- Safe to run again.

update public.restaurants
set has_stuffies = true
where slug in (
  'anthonys-seafood',
  'aunt-carries',
  'fieldstones',
  'flos-middletown',
  'flos-portsmouth',
  'georges',
  'iggys-warwick'
);

select name, slug, town, has_stuffies
from public.restaurants
where slug in (
  'anthonys-seafood',
  'aunt-carries',
  'fieldstones',
  'flos-middletown',
  'flos-portsmouth',
  'georges',
  'iggys-warwick'
)
order by name;
