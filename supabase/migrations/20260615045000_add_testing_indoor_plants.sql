with testing_plants as (
  select *
  from (
    values
      (
        'golden-pothos',
        'Golden Pothos',
        'Epipremnum aureum',
        80,
        'A cheerful trailing pothos cutting with bright green leaves.',
        'Golden pothos is an easygoing indoor favorite that trails beautifully from shelves, baskets, and sunny kitchen corners.',
        'Easy',
        'Low to bright indirect light',
        'Water when the top inch of soil is dry',
        '4 inch starter pot',
        9,
        false,
        array['trailing', 'easy care', 'low light'],
        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
        'Golden pothos houseplant leaves'
      ),
      (
        'snake-plant',
        'Snake Plant',
        'Dracaena trifasciata',
        95,
        'A sturdy upright plant that handles busy homes well.',
        'Snake plants are resilient, sculptural, and great for beginners who want greenery without a demanding watering schedule.',
        'Easy',
        'Low to bright indirect light',
        'Let soil dry fully between waterings',
        '4 inch nursery pot',
        7,
        false,
        array['upright', 'easy care', 'low water'],
        'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=900&q=80',
        'Snake plant in a pot'
      ),
      (
        'spider-plant',
        'Spider Plant',
        'Chlorophytum comosum',
        85,
        'A playful plant with arching leaves and baby plantlets.',
        'Spider plants are friendly, fast growers that look sweet in hanging baskets or tucked near a bright window.',
        'Easy',
        'Bright indirect light',
        'Keep lightly moist, not soggy',
        '4 inch starter pot',
        8,
        false,
        array['pet friendly', 'hanging', 'easy care'],
        'https://images.unsplash.com/photo-1620127807580-990c3e7152b5?auto=format&fit=crop&w=900&q=80',
        'Spider plant with striped leaves'
      ),
      (
        'peace-lily',
        'Peace Lily',
        'Spathiphyllum wallisii',
        125,
        'Glossy green leaves with a soft, classic houseplant look.',
        'Peace lilies bring a calm, homey feel indoors and will droop slightly to let you know when they need water.',
        'Moderate',
        'Medium to bright indirect light',
        'Water when the leaves begin to relax',
        '4 inch nursery pot',
        5,
        false,
        array['flowering', 'classic', 'medium light'],
        'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&w=900&q=80',
        'Peace lily houseplant'
      ),
      (
        'zz-plant',
        'ZZ Plant',
        'Zamioculcas zamiifolia',
        110,
        'Glossy upright stems that tolerate lower light.',
        'ZZ plants are sturdy, handsome houseplants that are forgiving if you forget a watering here and there.',
        'Easy',
        'Low to bright indirect light',
        'Water sparingly after soil dries',
        '4 inch nursery pot',
        6,
        false,
        array['upright', 'low light', 'low water'],
        'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=900&q=80',
        'ZZ plant glossy green leaves'
      ),
      (
        'heartleaf-philodendron',
        'Heartleaf Philodendron',
        'Philodendron hederaceum',
        100,
        'A sweet trailing philodendron with heart-shaped leaves.',
        'Heartleaf philodendron is a soft, trailing plant that grows happily on shelves, mantels, and plant stands.',
        'Easy',
        'Medium to bright indirect light',
        'Water when the top inch of soil is dry',
        '4 inch starter pot',
        10,
        false,
        array['trailing', 'heart leaves', 'easy care'],
        'https://images.unsplash.com/photo-1616507894052-00fe3f8c7c74?auto=format&fit=crop&w=900&q=80',
        'Heartleaf philodendron trailing plant'
      )
  ) as plant_data(
    slug,
    name,
    botanical_name,
    price_cents,
    short_description,
    description,
    care_level,
    light,
    water,
    size,
    inventory,
    featured,
    tags,
    image_src,
    image_alt
  )
),
upserted_plants as (
  insert into public.plants (
    slug,
    name,
    botanical_name,
    price_cents,
    short_description,
    description,
    care_level,
    light,
    water,
    size,
    inventory,
    featured,
    tags,
    active
  )
  select
    slug,
    name,
    botanical_name,
    price_cents,
    short_description,
    description,
    care_level,
    light,
    water,
    size,
    inventory,
    featured,
    tags,
    true
  from testing_plants
  on conflict (slug) do update
  set
    name = excluded.name,
    botanical_name = excluded.botanical_name,
    price_cents = excluded.price_cents,
    short_description = excluded.short_description,
    description = excluded.description,
    care_level = excluded.care_level,
    light = excluded.light,
    water = excluded.water,
    size = excluded.size,
    inventory = excluded.inventory,
    featured = excluded.featured,
    tags = excluded.tags,
    active = true
  returning id, slug
)
insert into public.plant_images (plant_id, src, alt, sort_order)
select upserted_plants.id, testing_plants.image_src, testing_plants.image_alt, 0
from upserted_plants
join testing_plants using (slug)
where not exists (
  select 1
  from public.plant_images
  where plant_images.plant_id = upserted_plants.id
    and plant_images.sort_order = 0
);
