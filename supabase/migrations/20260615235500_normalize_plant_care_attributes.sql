alter table public.plants
drop constraint if exists plants_care_level_check;

alter table public.plants
add column if not exists pot_size integer,
add column if not exists humidity text;

update public.plants
set
  care_level = plant_updates.care_level,
  light = plant_updates.light,
  water = plant_updates.water,
  pot_size = plant_updates.pot_size,
  size = plant_updates.pot_size || ' inch nursery pot',
  humidity = plant_updates.humidity
from (
  values
    ('baby-monstera', 'Easy', 'Bright Indirect', 'Weekly', 4, 'Moderate Humidity'),
    ('fiddle-leaf-fig', 'Moderate', 'Bright Indirect', 'Weekly', 10, 'Moderate Humidity'),
    ('golden-pothos', 'Easy', 'Low Light', 'Every 2-3 Weeks', 4, 'Moderate Humidity'),
    ('heartleaf-philodendron', 'Easy', 'Bright Indirect', 'Weekly', 4, 'Moderate Humidity'),
    ('monstera', 'Easy', 'Bright Indirect', 'Weekly', 8, 'High Humidity'),
    ('peace-lily', 'Moderate', 'Low Light', 'Keep Moist', 6, 'High Humidity'),
    ('snake-plant', 'Easy', 'Low Light', 'Every 2-3 Weeks', 6, 'Low Humidity'),
    ('spider-plant', 'Easy', 'Bright Indirect', 'Twice Weekly', 4, 'Moderate Humidity'),
    ('wandering-jew', 'Easy', 'Bright Indirect', 'Twice Weekly', 4, 'Moderate Humidity'),
    ('zz-plant', 'Easy', 'Low Light', 'Every 2-3 Weeks', 6, 'Low Humidity')
) as plant_updates(slug, care_level, light, water, pot_size, humidity)
where plants.slug = plant_updates.slug;

alter table public.plants
alter column pot_size set not null,
alter column humidity set not null;

alter table public.plants
add constraint plants_care_level_check check (care_level in ('Easy', 'Moderate', 'Hard')),
add constraint plants_light_check check (light in ('Low Light', 'Bright Indirect', 'Direct Sun')),
add constraint plants_water_check check (water in ('Keep Moist', 'Twice Weekly', 'Weekly', 'Every 2-3 Weeks')),
add constraint plants_pot_size_check check (pot_size in (4, 6, 8, 10, 12, 14, 16)),
add constraint plants_humidity_check check (humidity in ('Low Humidity', 'Moderate Humidity', 'High Humidity'));
