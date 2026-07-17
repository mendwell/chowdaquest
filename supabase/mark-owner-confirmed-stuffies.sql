-- Marks additional Stuffies / stuffed quahogs availability confirmed by ChowdaQuest owner.
-- Run after fix-review-category-constraint.sql has added has_stuffies.
-- Safe to run again.

update public.restaurants
set has_stuffies = true,
    verification_notes = concat_ws(
      ' ',
      nullif(trim(coalesce(verification_notes, '')), ''),
      'Stuffies availability confirmed directly by the ChowdaQuest owner.'
    )
where slug in (
  'tickets-bar-grille',
  'tremblays',
  'valley-inn-portsmouth'
);

select name, slug, town, has_stuffies, verification_notes
from public.restaurants
where slug in (
  'tickets-bar-grille',
  'tremblays',
  'valley-inn-portsmouth'
)
order by name;
