-- BestGanu Supabase Initialization & Table Setup File
-- Copy-paste this SQL block directly into your Supabase Dashboard SQL Editor to establish database schemas!

-- 1. Create ACCOUNTS table to store user profile metrics
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  carbon_saved_kg INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo" 
ON accounts FOR ALL 
USING (true) 
WITH CHECK (true);


-- 2. Create ASSETS table protecting your eco-tourism marketplace inventories
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('wetlands', 'islands', 'culture', 'homestay', 'food')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  image TEXT,
  eco_badges TEXT[] DEFAULT '{}',
  vendor_name TEXT,
  vendor_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Assets
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo assets"
ON assets FOR ALL
USING (true)
WITH CHECK (true);


-- 3. Create BOOKINGS (QR Tickets) table relating users to experiences
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  experience_id TEXT REFERENCES assets(id) ON DELETE CASCADE,
  booked_by TEXT NOT NULL,
  booking_date DATE NOT NULL,
  guest_count INTEGER DEFAULT 1 CHECK (guest_count >= 1),
  price NUMERIC NOT NULL CHECK (price >= 0),
  qr_code_data TEXT UNIQUE NOT NULL,
  eco_impact_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo bookings"
ON bookings FOR ALL
USING (true)
WITH CHECK (true);


-- 4. Seed premium initial marketplace assets (experiences)
INSERT INTO assets (id, name, category, location, description, price, rating, reviews, image, eco_badges, vendor_name, vendor_contact)
VALUES 
(
  'exp1', 
  'Setiu Wetlands Boardwalk & Mangrove Replanting', 
  'wetlands', 
  'Setiu, Terengganu', 
  'Walk through pristine estuary forests, identify unique flora (Nypa, Rhizophora), and actively participate in replanting mangrove saplings. Led by state-certified heritage eco-naturalists who safeguard local sea shell nurseries.', 
  45.0, 
  4.9, 
  148, 
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Zero Plastic', 'Mangrove Replant Match', 'Local Guide Certified', 'Low Carbon Journey'], 
  'Yusuf bin Ibrahim (Persatuan Sahabat Setiu)', 
  '+60 13-921 4451'
),
(
  'exp2', 
  'Chagar Hutang Sea Turtle Sanctuary Match', 
  'islands', 
  'Redang Island, Terengganu', 
  'A non-disruptive, educational visit to the island’s primary nesting ground. Watch conservation researchers audit nests, learn the safe crawl patterns of Green and Hawksbill turtles, and directly support turtle tag and release programs.', 
  150.0, 
  4.85, 
  94, 
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Turtle Conservation Match', 'Limited Guest Capacity', 'Zero Emission Lights'], 
  'Dr. Nadia & Redang Marine Park Guard Guild', 
  '+60 19-321 8872'
),
(
  'exp3', 
  'Kampung Mangkuk Traditional Terrapin Feed & Hatchery', 
  'wetlands', 
  'Kampung Mangkuk, Setiu', 
  'Learn the difference between ocean turtles and land-based river terrapins! Support the river terrapin protection project of Setiu. Feed hatchlings, measure shells, and explore local coconut orchards.', 
  25.0, 
  4.95, 
  73, 
  'https://images.unsplash.com/photo-1518467166-367dd630d267?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Species Preservation Support', 'Community Led-Enterprise', 'Traditional Snack Provided'], 
  'Abang Din (Mangkuk Wild Conservationists)', 
  '+60 12-985 3012'
),
(
  'exp4', 
  'Traditional Wooden Boat Preservation Duyong Walk', 
  'culture', 
  'Duyong Island, Kuala Terengganu', 
  'Watch regional master boat builders craft ocean liners and elegant pinas boats out of seasoned tropical hardwood. This heritage process uses no blueprint paper or metal nails; slots are joined using hand-whittled wooden dowels.', 
  20.0, 
  4.78, 
  62, 
  'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Endangered Heritage Guild', 'Family-Owned Museum', 'Walk-Only Itinerary'], 
  'Pakcik Haji Rani (Heritage Boat Workshop)', 
  '+60 17-911 3491'
),
(
  'exp5', 
  'Batik Co-op Beeswax Stencil & Organic Dyeing', 
  'culture', 
  'Kuala Ibai, Kuala Terengganu', 
  'Create your own Terengganu batik motif on organic bamboo fabric. Learn beeswax wax-resist chanting, prepare natural dyes boiled from local mangosteen skins and sea almonds, and support rural women batik cooperative guilds.', 
  35.0, 
  4.92, 
  110, 
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Biodegradable Organic Dyes', 'Women Empowerment Co-op', 'Slow-Fashion advocate'], 
  'Puan Halimah (Kuala Ibai Batik Sisterhood)', 
  '+60 14-884 0021'
),
(
  'exp6', 
  'Kapas Island Snorkeling & Coral Planting', 
  'islands', 
  'Kapas Island, Marang', 
  'Take a short, low-energy craft ride to Kapas Island. Work alongside volunteer marine biologists to place healthy coral polyps on conservation reef grids, assisting Kapas Reef Guard recover bleached local coral walls.', 
  95.0, 
  4.88, 
  125, 
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', 
  ARRAY['Reef Restoration Practice', 'No Anchorage Certified', 'Marine Micro-Donations included'], 
  'Captain Harun (Ocean Rangers Marine Service)', 
  '+60 11-125 4310'
)
ON CONFLICT (id) DO NOTHING;
