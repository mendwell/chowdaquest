alter table public.restaurants
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.restaurants.latitude is 'Verified latitude used for the Worth The Drive map.';
comment on column public.restaurants.longitude is 'Verified longitude used for the Worth The Drive map.';
