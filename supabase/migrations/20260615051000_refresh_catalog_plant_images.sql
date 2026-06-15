with desired_images as (
  select *
  from (
    values
      ('baby-monstera', 0, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80', 'Baby monstera in a bright indoor pot'),
      ('baby-monstera', 1, 'https://images.unsplash.com/photo-1620127252536-03bdfcf6d5c3?auto=format&fit=crop&w=900&q=80', 'Close up of young monstera leaves'),
      ('baby-monstera', 2, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80', 'Small indoor plant on a shelf'),
      ('fiddle-leaf-fig', 0, 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=900&q=80', 'Fiddle leaf fig in a sunny room'),
      ('fiddle-leaf-fig', 1, 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80', 'Large green indoor plant leaves'),
      ('fiddle-leaf-fig', 2, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80', 'Houseplant leaves near a window'),
      ('golden-pothos', 0, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80', 'Golden pothos trailing leaves'),
      ('golden-pothos', 1, 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80', 'Trailing houseplant in soft light'),
      ('golden-pothos', 2, 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80', 'Green pothos style leaves'),
      ('heartleaf-philodendron', 0, 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80', 'Heartleaf philodendron trailing indoors'),
      ('heartleaf-philodendron', 1, 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80', 'Heart shaped green houseplant leaves'),
      ('heartleaf-philodendron', 2, 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80', 'Lush green indoor plant leaves'),
      ('monstera', 0, 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80', 'Monstera houseplant in a warm room'),
      ('monstera', 1, 'https://images.unsplash.com/photo-1620127252536-03bdfcf6d5c3?auto=format&fit=crop&w=900&q=80', 'Monstera leaves close up'),
      ('monstera', 2, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80', 'Large tropical indoor leaves'),
      ('peace-lily', 0, 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80', 'Peace lily style indoor plant'),
      ('peace-lily', 1, 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80', 'Potted plant with glossy leaves'),
      ('peace-lily', 2, 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80', 'Indoor plant near a bright window'),
      ('snake-plant', 0, 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80', 'Upright snake plant style houseplant'),
      ('snake-plant', 1, 'https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=900&q=80', 'Tall potted indoor plant'),
      ('snake-plant', 2, 'https://images.unsplash.com/photo-1555037015-1498966bcd7c?auto=format&fit=crop&w=900&q=80', 'Structured green houseplant leaves'),
      ('spider-plant', 0, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80', 'Spider plant style starter plant'),
      ('spider-plant', 1, 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80', 'Hanging indoor greenery'),
      ('spider-plant', 2, 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80', 'Striped houseplant leaves'),
      ('wandering-jew', 0, 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80', 'Colorful trailing indoor plant'),
      ('wandering-jew', 1, 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80', 'Trailing plant leaves close up'),
      ('wandering-jew', 2, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80', 'Green trailing plant on a shelf'),
      ('zz-plant', 0, 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=900&q=80', 'ZZ plant glossy leaves'),
      ('zz-plant', 1, 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=900&q=80', 'Upright low light houseplant'),
      ('zz-plant', 2, 'https://images.unsplash.com/photo-1555037015-1498966bcd7c?auto=format&fit=crop&w=900&q=80', 'Glossy structured indoor plant leaves')
  ) as image_data(slug, sort_order, src, alt)
),
target_plants as (
  select id, slug
  from public.plants
  where slug in (select slug from desired_images)
),
deleted_images as (
  delete from public.plant_images
  using target_plants
  where plant_images.plant_id = target_plants.id
    and plant_images.sort_order between 0 and 2
  returning plant_images.id
)
insert into public.plant_images (plant_id, src, alt, sort_order)
select target_plants.id, desired_images.src, desired_images.alt, desired_images.sort_order
from desired_images
join target_plants using (slug);
