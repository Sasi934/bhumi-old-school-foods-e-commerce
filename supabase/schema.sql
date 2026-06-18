-- ============================================
-- BHUMI OLD SCHOOL FOODS - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CATEGORIES TABLE
-- ============================================
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_telugu text,
  slug text unique not null,
  description text,
  description_telugu text,
  icon text,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_telugu text,
  slug text unique not null,
  description text,
  description_telugu text,
  category_id uuid references categories(id),
  price decimal(10,2) default 0.00,
  unit text default '500g',
  stock_quantity integer default 100,
  is_available boolean default true,
  is_featured boolean default false,
  image_url text,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
create table if not exists customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  subtotal decimal(10,2) not null,
  shipping_charge decimal(10,2) default 0.00,
  total_amount decimal(10,2) not null,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text default 'placed' check (order_status in ('placed','confirmed','processing','shipped','delivered','cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  product_price decimal(10,2) not null,
  quantity integer not null,
  subtotal decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- SEED: CATEGORIES
-- ============================================
insert into categories (name, name_telugu, slug, description, icon, display_order) values
('Healthy Flours & Mixes', 'ఆరోగ్యకరమైన పిండి & మిక్స్', 'flours-mixes', 'Traditional stone-ground flours and wholesome mixes', '🌾', 1),
('Traditional Millets', 'సాంప్రదాయ చిరుధాన్యాలు', 'millets', 'Ancient grains cultivated for centuries in Telugu households', '🌾', 2),
('Rice & Pulses', 'బియ్యం & పప్పులు', 'rice-pulses', 'Heritage varieties of rice and organic pulses', '🍚', 3),
('Spices & Powders', 'మసాలాలు & పొడులు', 'spices-powders', 'Farm-fresh spices ground the traditional way', '🌶️', 4),
('Natural Care Products', 'సహజ సంరక్షణ ఉత్పత్తులు', 'natural-care', 'Skin and body care from nature''s pantry', '🛁', 5),
('Cold Pressed Oils', 'చల్లని నొక్కిన నూనెలు', 'cold-pressed-oils', 'Wood-pressed oils retaining full nutrition', '🥥', 6),
('Homemade Pickles', 'ఇంట తయారు చేసిన ఊరగాయలు', 'pickles', 'Traditional recipes handed down through generations', '🥒', 7),
('Sweeteners & Snacks', 'తీపి పదార్థాలు & స్నాక్స్', 'sweeteners-snacks', 'Natural sweeteners and healthy traditional snacks', '🍯', 8);

-- ============================================
-- SEED: PRODUCTS
-- ============================================

-- Healthy Flours & Mixes
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Kandhipappu (Roasted Toor Dal)', 'కంది పప్పు (వేయించిన)', 'kandhipappu-roasted-toor-dal', 'Stone-ground roasted toor dal flour, rich in protein and traditionally used in Telugu cooking for pappu and dal preparations.', (select id from categories where slug='flours-mixes'), '500g', true, ARRAY['protein','traditional','gluten-free']),
('Multigrain Atta (with Kapil Wheat)', 'మల్టీగ్రెయిన్ అట్ట (కపిల్ గోధుమతో)', 'multigrain-atta-kapil-wheat', 'Blend of ancient grains with heritage Kapil wheat, slow-ground on stone chakki for maximum nutrition and flavour.', (select id from categories where slug='flours-mixes'), '1kg', true, ARRAY['multigrain','wheat','traditional']),
('Sprouted Multigrain Malt', 'మొలకెత్తిన మల్టీగ్రెయిన్ మాల్ట్', 'sprouted-multigrain-malt', 'Naturally sprouted multigrain malt for wholesome drinks and porridges. Excellent for children and the elderly.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['sprouted','malt','kids','energy']),
('Sprouted Multigrain Idly Rava', 'మొలకెత్తిన మల్టీగ్రెయిన్ ఇడ్లీ రవ్వ', 'sprouted-multigrain-idly-rava', 'Sprouted multigrain rava crafted for soft, nutritious idlis. A healthier twist on the South Indian breakfast classic.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['sprouted','idly','breakfast']),
('Sprouted Multigrain Upma Rava', 'మొలకెత్తిన మల్టీగ్రెయిన్ ఉప్మా రవ్వ', 'sprouted-multigrain-upma-rava', 'Wholesome multigrain rava for nutritious upma. Combines taste with health in your morning meal.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['sprouted','upma','breakfast']),
('Sprouted Ragi Flour', 'మొలకెత్తిన రాగి పిండి', 'sprouted-ragi-flour', 'Sprouted finger millet flour packed with calcium and iron. Ideal for rotis, porridges and health drinks.', (select id from categories where slug='flours-mixes'), '500g', true, ARRAY['ragi','calcium','sprouted','gluten-free']),
('Sprouted Ragi Rava', 'మొలకెత్తిన రాగి రవ్వ', 'sprouted-ragi-rava', 'Coarse-ground sprouted ragi for upma, khichdi and savoury bowls. High in dietary fibre.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['ragi','fibre','sprouted']),
('Sprouted Jonna Rava', 'మొలకెత్తిన జొన్న రవ్వ (పచ్చ జొన్న 50% + తెల్ల జొన్న 50%)', 'sprouted-jonna-rava', 'Premium blend of green sorghum (50%) and white sorghum (50%), sprouted and milled traditionally. Gluten-free and gut-friendly.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['jowar','sorghum','gluten-free','sprouted']),
('Jonna Pindi', 'జొన్న పిండి', 'jonna-pindi', 'Pure sorghum flour stone-ground the traditional way. Versatile for rotis, porridges, and traditional Telugu dishes.', (select id from categories where slug='flours-mixes'), '500g', false, ARRAY['jowar','sorghum','traditional','gluten-free']),
('Plain Kapil Wheat Atta Flour', 'కపిల్ గోధుమ అట్ట పిండి', 'kapil-wheat-atta', 'Heritage Kapil wheat variety milled on stone chakki. Richer in nutrients than modern wheat varieties.', (select id from categories where slug='flours-mixes'), '1kg', true, ARRAY['wheat','heritage','atta','traditional']);

-- Traditional Millets
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Sajjalu (Pearl Millet)', 'సజ్జలు', 'sajjalu-pearl-millet', 'Organically grown pearl millet — a cooling grain packed with iron and energy. Traditional staple of Andhra households.', (select id from categories where slug='millets'), '500g', true, ARRAY['millet','iron','cooling','traditional']),
('Korralu (Foxtail Millet)', 'కొర్రలు', 'korralu-foxtail-millet', 'Foxtail millet — one of the oldest cultivated crops. Rich in complex carbohydrates, ideal for diabetics.', (select id from categories where slug='millets'), '500g', true, ARRAY['millet','diabetic-friendly','ancient-grain']),
('Uddalu (Black Gram Millet)', 'ఉద్దలు', 'uddalu', 'Traditional millet variety with rich earthy flavour. Excellent source of protein and dietary fibre.', (select id from categories where slug='millets'), '500g', false, ARRAY['millet','protein','fibre']),
('Samalu (Little Millet)', 'సామలు', 'samalu-little-millet', 'Tiny but mighty little millet. Gluten-free, low glycemic and perfect for pongal, rice dishes and porridges.', (select id from categories where slug='millets'), '500g', false, ARRAY['millet','gluten-free','low-gi']),
('Arikalu (Kodo Millet)', 'అరికలు', 'arikalu-kodo-millet', 'Kodo millet — known for its detoxifying properties. Used in traditional Ayurvedic cooking for centuries.', (select id from categories where slug='millets'), '500g', false, ARRAY['millet','ayurvedic','detox']),
('Quinoa', 'క్వినోవా', 'quinoa', 'Organically farmed quinoa — complete plant protein with all 9 essential amino acids. Perfect modern superfood.', (select id from categories where slug='millets'), '500g', true, ARRAY['quinoa','protein','superfood','gluten-free']);

-- Rice & Pulses
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Mixed Rice', 'మిక్స్డ్ రైస్', 'mixed-rice', 'Curated blend of heritage rice varieties. Each grain tells a story of traditional farming and soil wisdom.', (select id from categories where slug='rice-pulses'), '1kg', false, ARRAY['rice','heritage','mixed']),
('Navara Rice', 'నవార రైస్', 'navara-rice', 'Ancient Kerala medicinal rice variety, reddish-brown with a nutty aroma. Used in Ayurvedic treatments for centuries.', (select id from categories where slug='rice-pulses'), '1kg', true, ARRAY['rice','ayurvedic','medicinal','heritage']),
('Pesara Pappu (Green Moong Dal)', 'పెసర పప్పు', 'pesara-pappu', 'Organic green moong dal, light on digestion and rich in plant protein. A Telugu kitchen staple.', (select id from categories where slug='rice-pulses'), '500g', false, ARRAY['dal','protein','light','digestive']),
('Pachi Senaga Pappu (Raw Chana Dal)', 'పచ్చి సెనగ పప్పు', 'pachi-senaga-pappu', 'Raw organic chana dal stone-cold pressed. High in zinc and fibre, used in chutneys and curries alike.', (select id from categories where slug='rice-pulses'), '500g', false, ARRAY['dal','chana','protein','zinc']),
('Thalla Jonnalu (White Sorghum)', 'తెల్ల జొన్నలు', 'thalla-jonnalu', 'White sorghum grain, organically grown. Mild in flavour, highly versatile for rotis, kheer and porridges.', (select id from categories where slug='rice-pulses'), '500g', false, ARRAY['sorghum','gluten-free','white']),
('Pacha Jonnalu (Green Sorghum)', 'పచ్చ జొన్నలు', 'pacha-jonnalu', 'Green sorghum — fresh, nutrient-dense variety harvested young. Distinct earthy flavour loved in Telangana.', (select id from categories where slug='rice-pulses'), '500g', false, ARRAY['sorghum','green','traditional']),
('Groundnuts', 'వేరుశెనగలు', 'groundnuts', 'Sun-dried organic groundnuts from native farms. Perfect for chutneys, snacks, and cold-pressed oil.', (select id from categories where slug='rice-pulses'), '500g', true, ARRAY['groundnut','peanut','protein','snack']);

-- Spices & Powders
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Red Chilli Powder', 'ఎర్ర మిర్చి పొడి', 'red-chilli-powder', 'Sun-dried and stone-ground red chillies from Andhra farms. Vibrant colour, bold heat, authentic flavour.', (select id from categories where slug='spices-powders'), '250g', true, ARRAY['spice','chilli','andhra','hot']),
('Turmeric Powder', 'పసుపు పొడి', 'turmeric-powder', 'Farm-fresh turmeric root, dried and ground traditionally. Rich in curcumin for immunity and anti-inflammation.', (select id from categories where slug='spices-powders'), '250g', true, ARRAY['turmeric','immunity','anti-inflammatory','ayurvedic']),
('Lakadong Turmeric Powder', 'లకడాంగ్ పసుపు పొడి', 'lakadong-turmeric-powder', 'Rare high-curcumin Lakadong turmeric from Meghalaya. Contains 7–12% curcumin — far superior to regular turmeric.', (select id from categories where slug='spices-powders'), '100g', true, ARRAY['turmeric','lakadong','premium','high-curcumin']),
('Sambar Karam', 'సాంబార్ కారం', 'sambar-karam', 'Traditional Telugu sambar powder, hand-blended with heritage spices. The soul of every South Indian kitchen.', (select id from categories where slug='spices-powders'), '250g', true, ARRAY['sambar','masala','traditional','andhra']),
('Lavangam (Cloves)', 'లవంగాలు', 'lavangam-cloves', 'Whole organic cloves with intense aroma and warmth. Used in cooking, chai and traditional medicine.', (select id from categories where slug='spices-powders'), '100g', false, ARRAY['cloves','whole-spice','aromatic']),
('Jaji Kaya (Nutmeg)', 'జాజి కాయ', 'jaji-kaya-nutmeg', 'Whole organic nutmeg — warm, sweet and earthy. Used in biryanis, desserts and digestive preparations.', (select id from categories where slug='spices-powders'), '100g', false, ARRAY['nutmeg','whole-spice','aromatic']),
('Miriyalu (Black Pepper)', 'మిరియాలు', 'miriyalu-black-pepper', 'Bold, aromatic black pepper from organic farms. The king of spices in its most authentic form.', (select id from categories where slug='spices-powders'), '100g', false, ARRAY['pepper','black-pepper','spice']),
('Japathri (Mace)', 'జాపత్రి', 'japathri-mace', 'Delicate mace — the lacy covering of nutmeg. Floral, warm notes that elevate biryanis and kormas.', (select id from categories where slug='spices-powders'), '50g', false, ARRAY['mace','spice','biryani','aromatic']);

-- Natural Care Products
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Bath Powder', 'స్నాన పొడి', 'bath-powder', 'Traditional herbal bath powder with neem, turmeric and sandalwood. Cleanses, brightens and nourishes skin naturally.', (select id from categories where slug='natural-care'), '200g', false, ARRAY['bath','herbal','skincare','natural']),
('Bath Powder (Turmeric)', 'స్నాన పొడి (పసుపు)', 'bath-powder-turmeric', 'Turmeric-enriched bath powder for radiant skin. Traditional grandma''s recipe for glow and skin health.', (select id from categories where slug='natural-care'), '200g', true, ARRAY['bath','turmeric','glow','skincare']),
('Soap Nut Powder (Ritha)', 'కుంకుడు పొడి', 'soap-nut-powder', 'Natural soap nut powder — chemical-free cleanser for hair and skin. Rich lather, gentle on scalp and skin.', (select id from categories where slug='natural-care'), '200g', true, ARRAY['soapnut','hair-care','natural','chemical-free']);

-- Cold Pressed Oils
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Coconut Oil (Cold Pressed)', 'కొబ్బరి నూనె (చల్లని నొక్కిన)', 'cold-pressed-coconut-oil', 'Wood-pressed virgin coconut oil extracted without heat. Rich in lauric acid for cooking, skin and hair.', (select id from categories where slug='cold-pressed-oils'), '500ml', true, ARRAY['coconut','cold-pressed','wood-pressed','virgin']),
('Groundnut Oil (Cold Pressed)', 'వేరుశెనగ నూనె (చల్లని నొక్కిన)', 'cold-pressed-groundnut-oil', 'Traditional wood-pressed groundnut oil — the gold standard of South Indian cooking. Full flavour, full nutrition.', (select id from categories where slug='cold-pressed-oils'), '1L', true, ARRAY['groundnut','cold-pressed','wood-pressed','cooking']),
('Black Sesame Oil (Cold Pressed)', 'నల్ల నువ్వుల నూనె (చల్లని నొక్కిన)', 'cold-pressed-black-sesame-oil', 'Cold-pressed black sesame oil — deeply nourishing for joints, skin and hair. Used in Ayurvedic massage therapies.', (select id from categories where slug='cold-pressed-oils'), '250ml', true, ARRAY['sesame','black-sesame','ayurvedic','cold-pressed']),
('White Sesame Oil (Cold Pressed)', 'తెల్ల నువ్వుల నూనె (చల్లని నొక్కిన)', 'cold-pressed-white-sesame-oil', 'Pure white sesame oil cold-pressed from organic sesame seeds. Light, nutty flavour perfect for cooking and dressing.', (select id from categories where slug='cold-pressed-oils'), '250ml', false, ARRAY['sesame','white-sesame','cold-pressed','light']);

-- Homemade Pickles
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Chicken Pickle', 'చికెన్ ఊరగాయ', 'chicken-pickle', 'Bold, spicy chicken pickle made with wood-pressed groundnut oil and traditional spice blends. Handmade in small batches.', (select id from categories where slug='pickles'), '300g', true, ARRAY['pickle','chicken','spicy','non-veg','homemade']),
('Tomato Pickle', 'టమాటా ఊరగాయ', 'tomato-pickle', 'Tangy, fiery tomato pickle slow-cooked with sun-dried chillies and tempering. A South Indian condiment classic.', (select id from categories where slug='pickles'), '300g', true, ARRAY['pickle','tomato','vegan','tangy','homemade']),
('Panda Mirchi Pickle', 'పండు మిర్చి ఊరగాయ', 'panda-mirchi-pickle', 'Ripe red chilli pickle marinated in mustard and fenugreek. Intense heat with a deep fermented richness.', (select id from categories where slug='pickles'), '300g', false, ARRAY['pickle','chilli','vegan','fermented','homemade']),
('Prawns Pickle', 'రొయ్యల ఊరగాయ', 'prawns-pickle', 'Coastal-style prawn pickle slow-cooked with Andhra spices and cold-pressed oil. A seafood lover''s treasure.', (select id from categories where slug='pickles'), '300g', true, ARRAY['pickle','prawns','seafood','non-veg','coastal','homemade']);

-- Sweeteners & Snacks
insert into products (name, name_telugu, slug, description, category_id, unit, is_featured, tags) values
('Jaggery (Kerala Tribal Jaggery)', 'బెల్లం (కేరళ ఆదివాసీ బెల్లం)', 'kerala-tribal-jaggery', 'Rare tribal jaggery from Kerala''s hill forests. Handcrafted in small batches with no additives. Deep caramel flavour.', (select id from categories where slug='sweeteners-snacks'), '500g', true, ARRAY['jaggery','tribal','natural','sweetener','kerala']),
('Jaggery Powder', 'బెల్లం పొడి', 'jaggery-powder', 'Fine jaggery powder from natural cane — no chemicals, no bleaching. Easy to use in sweets, drinks and baking.', (select id from categories where slug='sweeteners-snacks'), '500g', false, ARRAY['jaggery','powder','natural','sweetener']),
('Palli Chikki (Peanut Brittle)', 'పల్లీ చిక్కీ', 'palli-chikki', 'Crunchy peanut brittle made with jaggery — no sugar, no preservatives. Traditional Telugu festival sweet.', (select id from categories where slug='sweeteners-snacks'), '250g', true, ARRAY['chikki','peanut','jaggery','snack','festival']),
('Kaju Chikki (Cashew Brittle)', 'కాజు చిక్కీ', 'kaju-chikki', 'Luxurious cashew brittle set in golden jaggery. A premium snack that celebrates Indian confectionery traditions.', (select id from categories where slug='sweeteners-snacks'), '250g', true, ARRAY['chikki','cashew','premium','snack','jaggery']),
('Dry Fruit Laddu', 'డ్రై ఫ్రూట్ లడ్డు', 'dry-fruit-laddu', 'Handmade laddus packed with dates, nuts and seeds — no refined sugar. A nourishing, guilt-free indulgence.', (select id from categories where slug='sweeteners-snacks'), '250g', true, ARRAY['laddu','dry-fruit','no-sugar','healthy','sweet']),
('Nuvvulu Chikki (Sesame Brittle)', 'నువ్వుల చిక్కీ', 'nuvvulu-chikki', 'Crispy sesame seed brittle bound with pure jaggery. Calcium-rich traditional sweet loved across Telugu households.', (select id from categories where slug='sweeteners-snacks'), '250g', false, ARRAY['chikki','sesame','calcium','jaggery','traditional']);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read access for categories and products
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read products" on products for select using (true);

-- Customers can insert their own records
create policy "Anyone can insert customers" on customers for insert with check (true);
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Anyone can insert order_items" on order_items for insert with check (true);
create policy "Anyone can read own orders" on orders for select using (true);
create policy "Anyone can read order_items" on order_items for select using (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- Generate order number
create or replace function generate_order_number()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'BHM-';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;
