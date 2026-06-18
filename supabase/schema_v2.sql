-- ============================================================
-- BHUMI OLD SCHOOL FOODS — FULL SCHEMA v2
-- Run this COMPLETELY in Supabase SQL Editor (replaces v1)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_telugu text,
  slug text unique not null,
  description text,
  description_telugu text,
  icon text,
  image_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_telugu text,
  slug text unique not null,
  description text,
  description_telugu text,
  category_id uuid references categories(id),
  price decimal(10,2) default 0.00,
  original_price decimal(10,2) default 0.00,
  discount_percent integer default 0,
  unit text default '500g',
  stock_quantity integer default 100,
  is_available boolean default true,
  is_featured boolean default false,
  image_url text,
  image_urls text[] default '{}',
  tags text[] default '{}',
  sku text unique,
  weight_grams integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- USERS / PROFILES (extends Supabase Auth)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  is_admin boolean default false,
  wishlist uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ADDRESSES
-- ============================================================
create table if not exists addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  label text default 'Home',
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- COUPONS
-- ============================================================
create table if not exists coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  description text,
  type text not null check (type in ('percent','flat','free_shipping')),
  value decimal(10,2) not null,
  min_order_amount decimal(10,2) default 0,
  max_discount_amount decimal(10,2),
  usage_limit integer,
  used_count integer default 0,
  is_active boolean default true,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  user_id uuid references profiles(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal decimal(10,2) not null,
  discount_amount decimal(10,2) default 0,
  shipping_charge decimal(10,2) default 0,
  total_amount decimal(10,2) not null,
  coupon_code text,
  coupon_id uuid references coupons(id),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  order_status text default 'placed' check (order_status in ('placed','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  product_image text,
  product_price decimal(10,2) not null,
  quantity integer not null,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id),
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_verified_purchase boolean default false,
  is_approved boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
create table if not exists order_status_history (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- SEED: CATEGORIES
-- ============================================================
insert into categories (name, name_telugu, slug, description, icon, display_order) values
('Healthy Flours & Mixes', 'ఆరోగ్యకరమైన పిండి & మిక్స్', 'flours-mixes', 'Traditional stone-ground flours and wholesome mixes', '🌾', 1),
('Traditional Millets', 'సాంప్రదాయ చిరుధాన్యాలు', 'millets', 'Ancient grains cultivated for centuries in Telugu households', '🌾', 2),
('Rice & Pulses', 'బియ్యం & పప్పులు', 'rice-pulses', 'Heritage varieties of rice and organic pulses', '🍚', 3),
('Spices & Powders', 'మసాలాలు & పొడులు', 'spices-powders', 'Farm-fresh spices ground the traditional way', '🌶️', 4),
('Natural Care Products', 'సహజ సంరక్షణ ఉత్పత్తులు', 'natural-care', 'Skin and body care from nature''s pantry', '🛁', 5),
('Cold Pressed Oils', 'చల్లని నొక్కిన నూనెలు', 'cold-pressed-oils', 'Wood-pressed oils retaining full nutrition', '🥥', 6),
('Homemade Pickles', 'ఇంట తయారు చేసిన ఊరగాయలు', 'pickles', 'Traditional recipes handed down through generations', '🥒', 7),
('Sweeteners & Snacks', 'తీపి పదార్థాలు & స్నాక్స్', 'sweeteners-snacks', 'Natural sweeteners and healthy traditional snacks', '🍯', 8)
on conflict (slug) do nothing;

-- ============================================================
-- SEED: PRODUCTS (all 50+)
-- ============================================================
-- Flours & Mixes
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Kandhipappu (Roasted Toor Dal)', 'కంది పప్పు (వేయించిన)', 'kandhipappu-roasted-toor-dal', 'Stone-ground roasted toor dal flour, rich in protein and traditionally used in Telugu cooking.', (select id from categories where slug='flours-mixes'), '500g', 180, 160, true, ARRAY['protein','traditional','gluten-free']),
('Multigrain Atta (with Kapil Wheat)', 'మల్టీగ్రెయిన్ అట్ట', 'multigrain-atta-kapil-wheat', 'Blend of ancient grains with heritage Kapil wheat, slow-ground on stone chakki for maximum nutrition.', (select id from categories where slug='flours-mixes'), '1kg', 220, 199, true, ARRAY['multigrain','wheat','traditional']),
('Sprouted Multigrain Malt', 'మొలకెత్తిన మల్టీగ్రెయిన్ మాల్ట్', 'sprouted-multigrain-malt', 'Naturally sprouted multigrain malt for wholesome drinks and porridges. Excellent for children and elderly.', (select id from categories where slug='flours-mixes'), '500g', 250, 220, false, ARRAY['sprouted','malt','kids','energy']),
('Sprouted Multigrain Idly Rava', 'మొలకెత్తిన ఇడ్లీ రవ్వ', 'sprouted-multigrain-idly-rava', 'Sprouted multigrain rava crafted for soft, nutritious idlis. A healthier twist on the South Indian breakfast classic.', (select id from categories where slug='flours-mixes'), '500g', 180, 160, false, ARRAY['sprouted','idly','breakfast']),
('Sprouted Multigrain Upma Rava', 'మొలకెత్తిన ఉప్మా రవ్వ', 'sprouted-multigrain-upma-rava', 'Wholesome multigrain rava for nutritious upma. Combines taste with health in your morning meal.', (select id from categories where slug='flours-mixes'), '500g', 180, 160, false, ARRAY['sprouted','upma','breakfast']),
('Sprouted Ragi Flour', 'మొలకెత్తిన రాగి పిండి', 'sprouted-ragi-flour', 'Sprouted finger millet flour packed with calcium and iron. Ideal for rotis, porridges and health drinks.', (select id from categories where slug='flours-mixes'), '500g', 160, 140, true, ARRAY['ragi','calcium','sprouted','gluten-free']),
('Sprouted Ragi Rava', 'మొలకెత్తిన రాగి రవ్వ', 'sprouted-ragi-rava', 'Coarse-ground sprouted ragi for upma, khichdi and savoury bowls. High in dietary fibre.', (select id from categories where slug='flours-mixes'), '500g', 160, 140, false, ARRAY['ragi','fibre','sprouted']),
('Sprouted Jonna Rava', 'మొలకెత్తిన జొన్న రవ్వ', 'sprouted-jonna-rava', 'Premium blend of green sorghum (50%) and white sorghum (50%), sprouted and milled traditionally.', (select id from categories where slug='flours-mixes'), '500g', 160, 145, false, ARRAY['jowar','sorghum','gluten-free','sprouted']),
('Jonna Pindi', 'జొన్న పిండి', 'jonna-pindi', 'Pure sorghum flour stone-ground the traditional way. Versatile for rotis, porridges, and traditional Telugu dishes.', (select id from categories where slug='flours-mixes'), '500g', 140, 120, false, ARRAY['jowar','sorghum','traditional','gluten-free']),
('Plain Kapil Wheat Atta Flour', 'కపిల్ గోధుమ అట్ట పిండి', 'kapil-wheat-atta', 'Heritage Kapil wheat variety milled on stone chakki. Richer in nutrients than modern wheat varieties.', (select id from categories where slug='flours-mixes'), '1kg', 200, 180, true, ARRAY['wheat','heritage','atta','traditional'])
on conflict (slug) do nothing;

-- Millets
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Sajjalu (Pearl Millet)', 'సజ్జలు', 'sajjalu-pearl-millet', 'Organically grown pearl millet — a cooling grain packed with iron and energy. Traditional staple of Andhra households.', (select id from categories where slug='millets'), '500g', 100, 90, true, ARRAY['millet','iron','cooling','traditional']),
('Korralu (Foxtail Millet)', 'కొర్రలు', 'korralu-foxtail-millet', 'Foxtail millet — one of the oldest cultivated crops. Rich in complex carbohydrates, ideal for diabetics.', (select id from categories where slug='millets'), '500g', 120, 105, true, ARRAY['millet','diabetic-friendly','ancient-grain']),
('Uddalu', 'ఉద్దలు', 'uddalu', 'Traditional millet variety with rich earthy flavour. Excellent source of protein and dietary fibre.', (select id from categories where slug='millets'), '500g', 110, 95, false, ARRAY['millet','protein','fibre']),
('Samalu (Little Millet)', 'సామలు', 'samalu-little-millet', 'Tiny but mighty little millet. Gluten-free, low glycemic and perfect for pongal and rice dishes.', (select id from categories where slug='millets'), '500g', 130, 115, false, ARRAY['millet','gluten-free','low-gi']),
('Arikalu (Kodo Millet)', 'అరికలు', 'arikalu-kodo-millet', 'Kodo millet — known for its detoxifying properties. Used in traditional Ayurvedic cooking for centuries.', (select id from categories where slug='millets'), '500g', 130, 115, false, ARRAY['millet','ayurvedic','detox']),
('Quinoa', 'క్వినోవా', 'quinoa', 'Organically farmed quinoa — complete plant protein with all 9 essential amino acids.', (select id from categories where slug='millets'), '500g', 350, 299, true, ARRAY['quinoa','protein','superfood','gluten-free'])
on conflict (slug) do nothing;

-- Rice & Pulses
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Mixed Rice', 'మిక్స్డ్ రైస్', 'mixed-rice', 'Curated blend of heritage rice varieties. Each grain tells a story of traditional farming.', (select id from categories where slug='rice-pulses'), '1kg', 150, 130, false, ARRAY['rice','heritage','mixed']),
('Navara Rice', 'నవార రైస్', 'navara-rice', 'Ancient Kerala medicinal rice variety, reddish-brown with a nutty aroma. Used in Ayurvedic treatments.', (select id from categories where slug='rice-pulses'), '1kg', 350, 299, true, ARRAY['rice','ayurvedic','medicinal','heritage']),
('Pesara Pappu (Green Moong Dal)', 'పెసర పప్పు', 'pesara-pappu', 'Organic green moong dal, light on digestion and rich in plant protein. A Telugu kitchen staple.', (select id from categories where slug='rice-pulses'), '500g', 120, 105, false, ARRAY['dal','protein','light','digestive']),
('Pachi Senaga Pappu (Raw Chana Dal)', 'పచ్చి సెనగ పప్పు', 'pachi-senaga-pappu', 'Raw organic chana dal. High in zinc and fibre, used in chutneys and curries alike.', (select id from categories where slug='rice-pulses'), '500g', 110, 95, false, ARRAY['dal','chana','protein','zinc']),
('Thalla Jonnalu (White Sorghum)', 'తెల్ల జొన్నలు', 'thalla-jonnalu', 'White sorghum grain, organically grown. Mild in flavour, highly versatile.', (select id from categories where slug='rice-pulses'), '500g', 100, 85, false, ARRAY['sorghum','gluten-free','white']),
('Pacha Jonnalu (Green Sorghum)', 'పచ్చ జొన్నలు', 'pacha-jonnalu', 'Green sorghum — fresh, nutrient-dense variety harvested young. Distinct earthy flavour.', (select id from categories where slug='rice-pulses'), '500g', 100, 85, false, ARRAY['sorghum','green','traditional']),
('Groundnuts', 'వేరుశెనగలు', 'groundnuts', 'Sun-dried organic groundnuts from native farms. Perfect for chutneys, snacks, and cold-pressed oil.', (select id from categories where slug='rice-pulses'), '500g', 120, 99, true, ARRAY['groundnut','peanut','protein','snack'])
on conflict (slug) do nothing;

-- Spices
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Red Chilli Powder', 'ఎర్ర మిర్చి పొడి', 'red-chilli-powder', 'Sun-dried and stone-ground red chillies from Andhra farms. Vibrant colour, bold heat.', (select id from categories where slug='spices-powders'), '250g', 120, 99, true, ARRAY['spice','chilli','andhra','hot']),
('Turmeric Powder', 'పసుపు పొడి', 'turmeric-powder', 'Farm-fresh turmeric root, dried and ground traditionally. Rich in curcumin.', (select id from categories where slug='spices-powders'), '250g', 100, 85, true, ARRAY['turmeric','immunity','anti-inflammatory','ayurvedic']),
('Lakadong Turmeric Powder', 'లకడాంగ్ పసుపు పొడి', 'lakadong-turmeric-powder', 'Rare high-curcumin Lakadong turmeric from Meghalaya. Contains 7–12% curcumin.', (select id from categories where slug='spices-powders'), '100g', 250, 199, true, ARRAY['turmeric','lakadong','premium','high-curcumin']),
('Sambar Karam', 'సాంబార్ కారం', 'sambar-karam', 'Traditional Telugu sambar powder, hand-blended with heritage spices.', (select id from categories where slug='spices-powders'), '250g', 150, 120, true, ARRAY['sambar','masala','traditional','andhra']),
('Lavangam (Cloves)', 'లవంగాలు', 'lavangam-cloves', 'Whole organic cloves with intense aroma and warmth.', (select id from categories where slug='spices-powders'), '100g', 120, 99, false, ARRAY['cloves','whole-spice','aromatic']),
('Jaji Kaya (Nutmeg)', 'జాజి కాయ', 'jaji-kaya-nutmeg', 'Whole organic nutmeg — warm, sweet and earthy.', (select id from categories where slug='spices-powders'), '100g', 140, 120, false, ARRAY['nutmeg','whole-spice','aromatic']),
('Miriyalu (Black Pepper)', 'మిరియాలు', 'miriyalu-black-pepper', 'Bold, aromatic black pepper from organic farms. The king of spices.', (select id from categories where slug='spices-powders'), '100g', 130, 110, false, ARRAY['pepper','black-pepper','spice']),
('Japathri (Mace)', 'జాపత్రి', 'japathri-mace', 'Delicate mace — the lacy covering of nutmeg. Floral, warm notes.', (select id from categories where slug='spices-powders'), '50g', 180, 150, false, ARRAY['mace','spice','biryani','aromatic'])
on conflict (slug) do nothing;

-- Natural Care
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Bath Powder', 'స్నాన పొడి', 'bath-powder', 'Traditional herbal bath powder with neem, turmeric and sandalwood.', (select id from categories where slug='natural-care'), '200g', 180, 150, false, ARRAY['bath','herbal','skincare','natural']),
('Bath Powder (Turmeric)', 'స్నాన పొడి (పసుపు)', 'bath-powder-turmeric', 'Turmeric-enriched bath powder for radiant skin. Traditional recipe for glow.', (select id from categories where slug='natural-care'), '200g', 180, 150, true, ARRAY['bath','turmeric','glow','skincare']),
('Soap Nut Powder (Ritha)', 'కుంకుడు పొడి', 'soap-nut-powder', 'Natural soap nut powder — chemical-free cleanser for hair and skin.', (select id from categories where slug='natural-care'), '200g', 200, 170, true, ARRAY['soapnut','hair-care','natural','chemical-free'])
on conflict (slug) do nothing;

-- Oils
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Coconut Oil (Cold Pressed)', 'కొబ్బరి నూనె', 'cold-pressed-coconut-oil', 'Wood-pressed virgin coconut oil extracted without heat. Rich in lauric acid.', (select id from categories where slug='cold-pressed-oils'), '500ml', 400, 350, true, ARRAY['coconut','cold-pressed','wood-pressed','virgin']),
('Groundnut Oil (Cold Pressed)', 'వేరుశెనగ నూనె', 'cold-pressed-groundnut-oil', 'Traditional wood-pressed groundnut oil — the gold standard of South Indian cooking.', (select id from categories where slug='cold-pressed-oils'), '1L', 550, 499, true, ARRAY['groundnut','cold-pressed','wood-pressed','cooking']),
('Black Sesame Oil (Cold Pressed)', 'నల్ల నువ్వుల నూనె', 'cold-pressed-black-sesame-oil', 'Cold-pressed black sesame oil — deeply nourishing for joints, skin and hair.', (select id from categories where slug='cold-pressed-oils'), '250ml', 400, 350, true, ARRAY['sesame','black-sesame','ayurvedic','cold-pressed']),
('White Sesame Oil (Cold Pressed)', 'తెల్ల నువ్వుల నూనె', 'cold-pressed-white-sesame-oil', 'Pure white sesame oil cold-pressed from organic sesame seeds. Light, nutty flavour.', (select id from categories where slug='cold-pressed-oils'), '250ml', 350, 299, false, ARRAY['sesame','white-sesame','cold-pressed','light'])
on conflict (slug) do nothing;

-- Pickles
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Chicken Pickle', 'చికెన్ ఊరగాయ', 'chicken-pickle', 'Bold, spicy chicken pickle made with wood-pressed groundnut oil and traditional spice blends.', (select id from categories where slug='pickles'), '300g', 350, 299, true, ARRAY['pickle','chicken','spicy','non-veg','homemade']),
('Tomato Pickle', 'టమాటా ఊరగాయ', 'tomato-pickle', 'Tangy, fiery tomato pickle slow-cooked with sun-dried chillies and tempering.', (select id from categories where slug='pickles'), '300g', 200, 170, true, ARRAY['pickle','tomato','vegan','tangy','homemade']),
('Panda Mirchi Pickle', 'పండు మిర్చి ఊరగాయ', 'panda-mirchi-pickle', 'Ripe red chilli pickle marinated in mustard and fenugreek.', (select id from categories where slug='pickles'), '300g', 220, 185, false, ARRAY['pickle','chilli','vegan','fermented','homemade']),
('Prawns Pickle', 'రొయ్యల ఊరగాయ', 'prawns-pickle', 'Coastal-style prawn pickle slow-cooked with Andhra spices and cold-pressed oil.', (select id from categories where slug='pickles'), '300g', 400, 350, true, ARRAY['pickle','prawns','seafood','non-veg','coastal','homemade'])
on conflict (slug) do nothing;

-- Sweeteners & Snacks
insert into products (name, name_telugu, slug, description, category_id, unit, original_price, price, is_featured, tags) values
('Jaggery (Kerala Tribal Jaggery)', 'బెల్లం (కేరళ ఆదివాసీ)', 'kerala-tribal-jaggery', 'Rare tribal jaggery from Kerala hill forests. Handcrafted in small batches with no additives.', (select id from categories where slug='sweeteners-snacks'), '500g', 200, 170, true, ARRAY['jaggery','tribal','natural','sweetener','kerala']),
('Jaggery Powder', 'బెల్లం పొడి', 'jaggery-powder', 'Fine jaggery powder from natural cane — no chemicals, no bleaching.', (select id from categories where slug='sweeteners-snacks'), '500g', 180, 150, false, ARRAY['jaggery','powder','natural','sweetener']),
('Palli Chikki (Peanut Brittle)', 'పల్లీ చిక్కీ', 'palli-chikki', 'Crunchy peanut brittle made with jaggery — no sugar, no preservatives.', (select id from categories where slug='sweeteners-snacks'), '250g', 150, 120, true, ARRAY['chikki','peanut','jaggery','snack','festival']),
('Kaju Chikki (Cashew Brittle)', 'కాజు చిక్కీ', 'kaju-chikki', 'Luxurious cashew brittle set in golden jaggery. A premium traditional snack.', (select id from categories where slug='sweeteners-snacks'), '250g', 250, 220, true, ARRAY['chikki','cashew','premium','snack','jaggery']),
('Dry Fruit Laddu', 'డ్రై ఫ్రూట్ లడ్డు', 'dry-fruit-laddu', 'Handmade laddus packed with dates, nuts and seeds — no refined sugar.', (select id from categories where slug='sweeteners-snacks'), '250g', 280, 240, true, ARRAY['laddu','dry-fruit','no-sugar','healthy','sweet']),
('Nuvvulu Chikki (Sesame Brittle)', 'నువ్వుల చిక్కీ', 'nuvvulu-chikki', 'Crispy sesame seed brittle bound with pure jaggery. Calcium-rich traditional sweet.', (select id from categories where slug='sweeteners-snacks'), '250g', 150, 120, false, ARRAY['chikki','sesame','calcium','jaggery','traditional'])
on conflict (slug) do nothing;

-- ============================================================
-- SEED: COUPONS
-- ============================================================
insert into coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, is_active) values
('WELCOME10', 'Welcome offer — 10% off your first order', 'percent', 10, 200, 100, 1000, true),
('BHUMI50', 'Flat ₹50 off on orders above ₹500', 'flat', 50, 500, 50, 500, true),
('ORGANIC15', '15% off on all organic products', 'percent', 15, 300, 200, 300, true),
('SAVE100', 'Flat ₹100 off on orders above ₹999', 'flat', 100, 999, 100, 200, true),
('MILLET20', '20% off on millet products', 'percent', 20, 150, 150, 200, true)
on conflict (code) do nothing;

-- ============================================================
-- AUTO-UPDATE timestamps
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ORDER NUMBER GENERATOR
-- ============================================================
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table order_status_history enable row level security;

-- Drop existing policies safely
do $$ begin
  drop policy if exists "Public read categories" on categories;
  drop policy if exists "Public read products" on products;
  drop policy if exists "Users read own profile" on profiles;
  drop policy if exists "Users update own profile" on profiles;
  drop policy if exists "Users read own addresses" on addresses;
  drop policy if exists "Users manage own addresses" on addresses;
  drop policy if exists "Public read coupons" on coupons;
  drop policy if exists "Anyone read orders" on orders;
  drop policy if exists "Anyone insert orders" on orders;
  drop policy if exists "Anyone insert order_items" on order_items;
  drop policy if exists "Anyone read order_items" on order_items;
  drop policy if exists "Anyone read reviews" on reviews;
  drop policy if exists "Anyone insert reviews" on reviews;
  drop policy if exists "Anyone read order_history" on order_status_history;
exception when others then null;
end $$;

create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users read own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users manage own addresses" on addresses for all using (auth.uid() = user_id);
create policy "Public read coupons" on coupons for select using (is_active = true);
create policy "Anyone read orders" on orders for select using (true);
create policy "Anyone insert orders" on orders for insert with check (true);
create policy "Anyone update orders" on orders for update using (true);
create policy "Anyone insert order_items" on order_items for insert with check (true);
create policy "Anyone read order_items" on order_items for select using (true);
create policy "Anyone read reviews" on reviews for select using (true);
create policy "Anyone insert reviews" on reviews for insert with check (true);
create policy "Anyone read order_history" on order_status_history for select using (true);
create policy "Anyone insert order_history" on order_status_history for insert with check (true);

-- Admin policies for products/coupons management
create policy "Admins manage products" on products for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins manage coupons" on coupons for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins manage categories" on categories for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins read all orders" on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admins update orders" on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
