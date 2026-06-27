-- ============================================================
-- UWELL CRM — One-Shot Database Setup Script
-- All tables use TEXT id (no UUID), all data included
-- Run this ONCE in a new Supabase SQL Editor
-- ============================================================

-- ============ 1. Drop existing tables (clean slate) ============
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.scan_records CASCADE;
DROP TABLE IF EXISTS public.qr_codes CASCADE;
DROP TABLE IF EXISTS public.campaign_reports CASCADE;
DROP TABLE IF EXISTS public.campaign_tasks CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.store_evaluations CASCADE;
DROP TABLE IF EXISTS public.material_outbound CASCADE;
DROP TABLE IF EXISTS public.material_inbound CASCADE;
DROP TABLE IF EXISTS public.material_stocks CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.fan_points_log CASCADE;
DROP TABLE IF EXISTS public.fan_points_rules CASCADE;
DROP TABLE IF EXISTS public.fan_level_rules CASCADE;
DROP TABLE IF EXISTS public.fans CASCADE;
DROP TABLE IF EXISTS public.visit_photos CASCADE;
DROP TABLE IF EXISTS public.visit_sales CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============ 2. Create tables (all TEXT ids) ============

CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'rep',
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  level TEXT DEFAULT '',
  chain_name TEXT DEFAULT '',
  chain_id TEXT DEFAULT NULL,
  chain_store_count INTEGER DEFAULT 0,
  contact TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_by TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT '',
  unit_price DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.visits (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  rep_id TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.visit_sales (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  sales_qty INTEGER DEFAULT 0,
  sales_amount DOUBLE PRECISION DEFAULT 0,
  stock_qty INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(visit_id, product_id)
);

CREATE TABLE public.visit_photos (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  photo_type TEXT DEFAULT 'product',
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.fans (
  id TEXT PRIMARY KEY,
  store_id TEXT DEFAULT NULL,
  user_id TEXT DEFAULT NULL,
  level TEXT NOT NULL DEFAULT 'bronze',
  points INTEGER NOT NULL DEFAULT 0,
  total_contribution INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.fan_points_log (
  id TEXT PRIMARY KEY,
  fan_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  source TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.fan_points_rules (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.fan_level_rules (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  benefits TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT '',
  unit TEXT DEFAULT 'pcs',
  unit_cost DOUBLE PRECISION DEFAULT 0,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.material_stocks (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  warehouse TEXT NOT NULL DEFAULT 'Default',
  qty INTEGER NOT NULL DEFAULT 0,
  safety_stock INTEGER NOT NULL DEFAULT 10,
  UNIQUE(material_id, warehouse)
);

CREATE TABLE public.material_inbound (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  operator_id TEXT DEFAULT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.material_outbound (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  applicant_id TEXT DEFAULT NULL,
  store_id TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.store_evaluations (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  eval_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score_sales INTEGER DEFAULT 5,
  score_display INTEGER DEFAULT 5,
  score_location INTEGER DEFAULT 5,
  score_cooperation INTEGER DEFAULT 5,
  score_expansion INTEGER DEFAULT 5,
  score_appearance INTEGER DEFAULT 5,
  total_score INTEGER DEFAULT 30,
  recommended_level TEXT DEFAULT 'C',
  evaluator_id TEXT DEFAULT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  description TEXT DEFAULT '',
  target_stores JSONB DEFAULT '[]',
  budget DOUBLE PRECISION DEFAULT 0,
  actual_cost DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_tasks (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  title TEXT NOT NULL,
  assignee_id TEXT DEFAULT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_reports (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sales DOUBLE PRECISION DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_scans INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  achievement_rate DOUBLE PRECISION DEFAULT 0,
  cost_ratio DOUBLE PRECISION DEFAULT 0,
  summary TEXT DEFAULT '',
  improvements TEXT DEFAULT '',
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.qr_codes (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  code TEXT NOT NULL,
  store_id TEXT DEFAULT NULL,
  points INTEGER DEFAULT 5,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.scan_records (
  id TEXT PRIMARY KEY,
  qr_code_id TEXT NOT NULL,
  fan_id TEXT DEFAULT NULL,
  product_id TEXT NOT NULL,
  store_id TEXT DEFAULT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.community_posts (
  id TEXT PRIMARY KEY,
  author_name TEXT DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Discussion',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.community_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_name TEXT DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ 3. RLS (simple: all open) ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "p_all" ON public.profiles FOR ALL USING (true);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "s_all" ON public.stores FOR ALL USING (true);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_all" ON public.products FOR ALL USING (true);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v_all" ON public.visits FOR ALL USING (true);
ALTER TABLE public.visit_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vs_all" ON public.visit_sales FOR ALL USING (true);
ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vp_all" ON public.visit_photos FOR ALL USING (true);
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "f_all" ON public.fans FOR ALL USING (true);
ALTER TABLE public.fan_points_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fpl_all" ON public.fan_points_log FOR ALL USING (true);
ALTER TABLE public.fan_points_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fpr_all" ON public.fan_points_rules FOR ALL USING (true);
ALTER TABLE public.fan_level_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flr_all" ON public.fan_level_rules FOR ALL USING (true);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "m_all" ON public.materials FOR ALL USING (true);
ALTER TABLE public.material_stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ms_all" ON public.material_stocks FOR ALL USING (true);
ALTER TABLE public.material_inbound ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mi_all" ON public.material_inbound FOR ALL USING (true);
ALTER TABLE public.material_outbound ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mo_all" ON public.material_outbound FOR ALL USING (true);
ALTER TABLE public.store_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "se_all" ON public.store_evaluations FOR ALL USING (true);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "c_all" ON public.campaigns FOR ALL USING (true);
ALTER TABLE public.campaign_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct_all" ON public.campaign_tasks FOR ALL USING (true);
ALTER TABLE public.campaign_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cr_all" ON public.campaign_reports FOR ALL USING (true);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_all" ON public.qr_codes FOR ALL USING (true);
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sr_all" ON public.scan_records FOR ALL USING (true);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp_all" ON public.community_posts FOR ALL USING (true);
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc_all" ON public.community_comments FOR ALL USING (true);

-- ============ 4. Auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>'role', 'rep'), COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ 5. INSERT ALL DATA ============

-- Products
INSERT INTO public.products (id, name, sku, category, unit_price) VALUES
('p-001','UWELL G4 PRO','UW-G4PRO','Device',80),
('p-002','UWELL G4 PRO COCO','UW-G4PRO-COCO','Device',80),
('p-003','UWELL G4','UW-G4','Device',65),
('p-004','UWELL G5','UW-G5','Device',120),
('p-005','UWELL KOKO','UW-KOKO','Device',50),
('p-006','UWELL Pod (G4)','UW-POD-G4','Pod',15),
('p-007','UWELL Pod (G5)','UW-POD-G5','Pod',18),
('p-008','UWELL Pod (KOKO)','UW-POD-KOKO','Pod',12);

-- Materials
INSERT INTO public.materials (id, name, sku, category, unit, unit_cost, image_url) VALUES
('m-001','UWELL Door Panel','MT-DOOR-PANEL','Display','pcs',5,''),
('m-002','UWELL Sticker','MT-STICKER','Promotional','pcs',0.5,''),
('m-003','UWELL Lightbox','MT-LIGHTBOX','Display','pcs',50,''),
('m-004','UWELL Acrylic Stand','MT-ACRYLIC-STAND','Display','pcs',30,''),
('m-005','UWELL Poster A2','MT-POSTER-A2','Promotional','pcs',2,''),
('m-006','UWELL Product Catalog','MT-CATALOG','Promotional','pcs',1.5,''),
('m-007','UWELL Staff Vest','MT-VEST','Uniform','pcs',25,''),
('m-008','UWELL Sample Pod','MT-SAMPLE-POD','Sample','pcs',3,'');

-- Material Stocks
INSERT INTO public.material_stocks (id, material_id, warehouse, qty, safety_stock) VALUES
('ms-001','m-001','Default',350,100),
('ms-002','m-002','Default',1200,500),
('ms-003','m-003','Default',12,20),
('ms-004','m-004','Default',25,15),
('ms-005','m-005','Default',800,200),
('ms-006','m-006','Default',8,50),
('ms-007','m-007','Default',45,30),
('ms-008','m-008','Default',300,100);

-- Fan Level Rules
INSERT INTO public.fan_level_rules (id, level, min_points, benefits) VALUES
('lr-001','bronze',0,'Basic benefits'),
('lr-002','silver',100,'5% discount'),
('lr-003','gold',500,'10% discount + priority delivery'),
('lr-004','platinum',2000,'15% discount + new product trials'),
('lr-005','diamond',5000,'20% discount + dedicated support');

-- Fan Points Rules
INSERT INTO public.fan_points_rules (id, action_type, points, description, is_active) VALUES
('r-001','Complete Visit',10,'Complete a store visit',true),
('r-002','Upload Photo',5,'Upload photos during visit',true),
('r-003','Submit Sales Data',5,'Submit complete sales data',true),
('r-004','Add New Store',20,'Successfully add a new store',true),
('r-005','Refer New Fan',30,'Refer a new fan registration',true),
('r-006','QR Scan',5,'Consumer scans product QR code',true);

-- Community Posts
INSERT INTO public.community_posts (id, author_name, content, category, likes) VALUES
('cp-001','UWELL Team','Just completed G5 training for 5 store owners in Riyadh! Great engagement 🚀','Event',12),
('cp-002','Field Rep','Competitor watch: OXVA Xlim Pro launching new colors next week. We need to push G4 PRO coil advantage.','Discussion',8),
('cp-003','Manager','Store upgrade: rabie alkayf went from B to A after display makeover! Sales up 40%','Event',15),
('cp-004','UWELL Team','Ramadan campaign results: 320 devices sold, 85 stores participated, 15 new fans registered','Share',20),
('cp-005','Field Rep','Pod shortage alert: G4 pods running low at 12 stores. Need urgent restock from distributor.','Discussion',7),
('cp-006','Manager','Best practice: Stores with UWELL lightbox sell 2.3x more than stores without. Push POSM installation!','Share',18),
('cp-007','Field Rep','Question: What is the best way to handle stores that only stock competitor products?','Question',5),
('cp-008','UWELL Team','G5 demo event at Just Smoke Vape was a hit! 20+ customers tried the device, 8 purchased on spot.','Event',25),
('cp-009','Manager','Welcome our newest fan from Amwaj Oasis! First scan earned 5 points 🎉','Event',10),
('cp-010','UWELL Team','Monthly KPI review: 80 stores covered, 41 active, 7 VIP (A-level). Need to push 10 more to A-level by Q3.','Share',14),
('cp-011','Field Rep','Just Smoke Vape now stocking full G5 range after successful demo. 15 units sold in first week!','Share',9),
('cp-012','Manager','Reminder: All field reps should add store owners to UWELL WhatsApp group during visits.','Discussion',6);
-- Stores (80)
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-001', 'rabie alkayf lilshiyshat walmueasal', 'https://maps.app.goo.gl/CAjbgREW4dTdtpbm9?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '504875886', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-002', 'muteat lilshiyshat waleasalat', 'https://maps.app.goo.gl/KgKdp1dGqiKcbefk9?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '598589221', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-003', 'mizaj almashhur lilshiysh walmueasalat', 'https://maps.app.goo.gl/KgKdp1dGqiKcbefk9?g_st=ic', 0, 0, 'B', 'UWELL Store', 4, '575122442', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-004', 'atayb almizaj', 'https://maps.app.goo.gl/oZhHiCUHdPsaj23TA?g_st=ic', 0, 0, 'B', 'UWELL Store', 4, '534174221', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-005', 'rihlat zaman lilshiysh walmueasalat', 'https://maps.app.goo.gl/4eftR9RjeGG419VKA?g_st=ic', 0, 0, 'C', 'UWELL Store', 2, '550957743', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-006', 'alruwqan aleali lilshiysh walmueasalat', 'https://maps.app.goo.gl/dRWhYEcQXdrEFkdH7?g_st=ic', 0, 0, 'B', 'UWELL Store', 1, '576259390', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-007', 'Amwaj Oasis for shisha', 'https://maps.app.goo.gl/c1rW6b5GyQN1Zisu5?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '558667142', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-008', 'Asl Al Tabkhir Company for Shisha and Molasses', 'https://maps.app.goo.gl/hEftKyex8hiq4p988?g_st=ic', 0, 0, 'B', 'UWELL Store', 3, '501218512', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-009', 'musaasat hiwar alkayf', 'https://maps.app.goo.gl/4ubpceFs9Tc7WpNx7?g_st=ic', 0, 0, 'C', 'UWELL Store', 6, '552052662', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-010', 'muasasat ''aemidat alnakhil lilshiyshat waldibs', 'https://maps.app.goo.gl/rbukQcqYmXpoLs9E6?g_st=ic', 0, 0, 'B', 'UWELL Store', 1, '553521136', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-011', 'eamduh alnakhlah lilshiyshat walmueasalat', 'https://maps.app.goo.gl/ENT5HZTqEdgxNwyF9?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '500298408', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-012', 'bayt almueasal fare aleazizia', 'https://maps.app.goo.gl/FHn43d3paKvsZupr6?g_st=ic', 0, 0, 'A', 'UWELL Store', 12, '569864771', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-013', 'abraj alkhalij aldhahabia', 'https://maps.app.goo.gl/rc7FBBd8nkGJ4xts6?g_st=ic', 0, 0, 'A', 'UWELL Store', 1, '599406520', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-014', 'eunwan almizaj lilshiysh walmueasalat', 'https://maps.app.goo.gl/nMV3UVJp4XMTs8LN7?g_st=ic', 0, 0, 'A', 'UWELL Store', 11, '510909145', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-015', 'muasisuh milha'' alshamri lilshiysh w almueasalat', 'https://maps.app.goo.gl/wytqyY4613hN7s2GA?g_st=ic', 0, 0, 'C', 'UWELL Store', 2, '534350514', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-016', 'mueasalat ''ajwa'' almizaj', 'https://maps.app.goo.gl/EhCLLHcHb8DkDUN97?g_st=ic', 0, 0, 'B', 'UWELL Store', 3, '502747027', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-017', 'lawazim aljawi lishish w almueasalat', 'https://maps.app.goo.gl/ieKqwCFh3wmAn74W7?g_st=ic', 0, 0, 'C', 'UWELL Store', 5, '572114738', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-018', 'mueasalat kayf aldiywani', 'https://maps.app.goo.gl/CcN8pAn47Lda3rQ88?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '544306770', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-019', 'mizaj altuwt lilshiysh walmueasalat Vip', 'https://maps.app.goo.gl/eDkVf5cVa7M2Tsmr6?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '575091200', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-020', 'sharakuh alrimal alfakhiruh altijarih lishish walmueasalat', 'https://maps.app.goo.gl/dbdiR46LxgS23ANV8?g_st=ic', 0, 0, 'B', 'UWELL Store', 3, '511462979', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-021', 'mizaj almasa'' fare aleazizih', 'https://maps.app.goo.gl/dwgs6yXvEgTJxiDs9?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '566742820', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-022', 'mueasalat ''adwa'' layalina', 'https://maps.app.goo.gl/CVwzRUMZXQrkGDrm8?g_st=ic', 0, 0, 'B', 'UWELL Store', 3, '508467658', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-023', 'jawiyun lilmueasalat', 'https://maps.app.goo.gl/cCfaqEEXwuw48ReM8?g_st=ic', 0, 0, 'C', 'UWELL Store', 2, '568624101', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-024', 'eunwan altabkhir lilshiysh walmueasalat aleazizia', 'https://maps.app.goo.gl/L9EriEwVX3Fj7ZeK8?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '509042457', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-025', 'Mood house', 'https://maps.app.goo.gl/bLsUzuKSqtfrtytV8?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '553123556', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-026', 'mueasal fakhr almizaj lilshiysh walmueasalat raqm 2', 'https://maps.app.goo.gl/a2Rsd3wN4STcquw9A?g_st=ic', 0, 0, 'B', 'UWELL Store', 3, '510841182', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-027', 'mizaj eali lilshiysh walmueasalat', 'https://maps.app.goo.gl/U54YoURstoCJtwsWA?g_st=ic', 0, 0, 'B', 'UWELL Store', 4, '511241404', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-028', 'mueasalat washish amwaj almuthanaa', 'https://maps.app.goo.gl/QAidFNENtYZfiV8w9?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '555036949', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-029', 'shish wamueasalat basti sumuk', 'https://maps.app.goo.gl/wtcerTnQCcyCfRWo9?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '533896474', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-030', 'mizaj almashhur lilshiysh walmueasalat', 'https://maps.app.goo.gl/DyPtfG3oUo99SabU8?g_st=ic', 0, 0, 'B', 'UWELL Store', 1, '598589921', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-031', 'shish wamueasalat jamrat layali', 'https://maps.app.goo.gl/a6RuqeGwybaXGG7s6?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '556338583', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-032', 'Just Smoke Vape and Shisha', 'https://maps.app.goo.gl/LqQhFyzyiRkhX5reA?g_st=ic', 0, 0, 'A', 'UWELL Store', 8, '536997022', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-033', 'masa'' alfakhir lilshiysh walmueasalat', 'https://maps.app.goo.gl/WMZQm9Nomvi39Mv7A?g_st=ic', 0, 0, 'B', 'UWELL Store', 5, '558199796', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-034', 'mahala shishih wa mueasalat khalatat alkhalikh jayid', 'https://maps.app.goo.gl/YtFYzChHVnwuPnFx7?g_st=ic', 0, 0, 'C', 'UWELL Store', 1, '564349262', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-035', 'Shish Ma''asalat Fata Najd 4', 'https://maps.app.goo.gl/6K8PQ14KvaZbNjyv8?g_st=ic', 0, 0, 'A', 'UWELL Store', 6, '531526657', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-036', 'shish mueasal lilshiysh almulaz husam', 'https://maps.app.goo.gl/9NVeL2gHYWxEWtbv7?g_st=ic', 0, 0, 'A', 'UWELL Store', 6, '502002854', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-037', 'shish mueasalat sahbat khayal', 'https://maps.app.goo.gl/931pxG7J92b7LrYo6?g_st=ic', 0, 0, 'C', 'UWELL Store', 2, '530670536', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-038', 'shish mueasalat albahrini2', 'https://maps.app.goo.gl/1rmJ8VQUeFmdaA9Z9?g_st=ic', 0, 0, 'B', 'UWELL Store', 2, '545739814', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-039', 'Al-kaif al-fakhir', 'https://maps.app.goo.gl/kd7cK1AKV2CWRmQ37?g_st=aw', 0, 0, 'A', 'UWELL Store', 1, '559956069', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-040', 'Nasmat al-masa lish-sheesh', 'https://maps.app.goo.gl/Ebr2gPt1d2Y7Ymzh6?g_st=ipc', 0, 0, 'B', 'UWELL Store', 3, '540475655', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-041', 'Mazaj Al-Naseem for Hookah', '', 0, 0, 'B', 'UWELL Store', 1, '538524039', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-042', 'Bayt al-moasal', 'https://maps.app.goo.gl/LPXTvU4zTgXBX119A?g_st=aw', 0, 0, '', 'UWELL Store', 7, '548104829', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-043', 'Nahkat al-tamayoz lil-moasalat', 'https://maps.app.goo.gl/iNjkd4WuFYczZ7qV9?g_st=aw', 0, 0, '', 'UWELL Store', 3, '558943081', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-044', 'Atheer al-kaif lil-moasalat', 'https://maps.app.goo.gl/MDtxdEd6rYQSTyuz6?g_st=ic', 0, 0, '', 'UWELL Store', 2, '505046909', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-045', 'Mazaj al-sa''adah lish-sheesh wal-moasalat', 'https://maps.app.goo.gl/51iDxpG1PcC7Sd5P8?g_st=ic', 0, 0, '', 'UWELL Store', 1, '555354621', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-046', 'Mr. Mazaj', 'https://maps.app.goo.gl/trF18H5X4pxdFJS19?g_st=ic', 0, 0, '', 'UWELL Store', 1, '554616590', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-047', 'Mazaj al-riyadh lish-sheesh', 'https://maps.app.goo.gl/tPTkpHgCkZ2B8HGx6?g_st=ic', 0, 0, '', 'UWELL Store', 1, '574254060', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-048', 'Mazaj al-qaisar', '', 0, 0, '', 'UWELL Store', 10, '503506065', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-049', 'Rawa''e al-modhesh lil-moasalat', 'https://maps.app.goo.gl/XynwwSuGw8iZ3gW88?g_st=ic', 0, 0, '', 'UWELL Store', 1, '563833825', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-050', 'Walle'' Kaif', '', 0, 0, '', 'UWELL Store', 1, '581816750', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-051', 'Kaif al-sulay lil-moasalat', 'https://maps.app.goo.gl/N1t6aXycKHbk6STM9?g_st=ic', 0, 0, '', 'UWELL Store', 2, '556799712', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-052', 'Rawaq al-rawabi lil-moasalat', 'https://maps.app.goo.gl/EpXkomWQjTNvxCEi6?g_st=ic', 0, 0, '', 'UWELL Store', 1, '567273410', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-053', 'Rawa''e lil-moasalat', 'https://maps.app.goo.gl/qbVJgYDgHTfHrQtDA?g_st=ic', 0, 0, '', 'UWELL Store', 1, '533390030', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-054', 'Mazaj Al-Asimah', 'https://maps.app.goo.gl/C4beDA5DRJ1HaFWq5?g_st=ic', 0, 0, '', 'UWELL Store', 1, '541813334', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-055', 'Hawa al-mazaj', 'https://maps.app.goo.gl/7FqdauB3g54Bv5oV9?g_st=aw', 0, 0, '', 'UWELL Store', 1, '575101856', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-056', 'Nokhbat al-nakhah lish-sheesh walmoasalat', 'https://maps.app.goo.gl/WfU9T5rL6fKsjKZM6?g_st=aw', 0, 0, '', 'UWELL Store', 1, '539659097', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-057', 'sheesh wal-moasalat', 'https://maps.app.goo.gl/Ti2b6uCgzkviUpAt8?g_st=aw', 0, 0, '', 'UWELL Store', 3, '565300282', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-058', 'Mood Plus', 'https://maps.app.goo.gl/e5o8zgLf4XfBzAUT8?g_st=ic', 0, 0, '', 'UWELL Store', 2, '541509630', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-059', 'Layali toffahati', 'https://maps.app.goo.gl/eP5rDJ7fAJDEasGo7?g_st=aw', 0, 0, '', 'UWELL Store', 1, '550996352', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-060', 'Mazaj lubnan', 'https://maps.app.goo.gl/phUEc49uxiY1bP8v5?g_st=aw', 0, 0, '', 'UWELL Store', 1, '561954228', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-061', 'Dhaw'' al-ilham', 'https://maps.app.goo.gl/rgzVJWh823CN4w3W8?g_st=aw', 0, 0, '', 'UWELL Store', 1, '57905583', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-062', 'Tooti beiruti', 'https://maps.app.goo.gl/x1JXg5SehjBBPu4N6?g_st=ic', 0, 0, '', 'UWELL Store', 1, '531637116', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-063', 'Vape, cigar wa ghalyoun', 'https://maps.app.goo.gl/dNhj7PxgCJLAye3A8?g_st=aw', 0, 0, '', 'UWELL Store', 4, '583250160', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-064', 'Tobacco house', 'https://maps.app.goo.gl/CagkKRTuhgvYt8jj6?g_st=aw', 0, 0, '', 'UWELL Store', 1, '558586639', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-065', 'Bida vape', 'https://maps.app.goo.gl/GXHpnwmLC5i2yP9q8?g_st=ic', 0, 0, '', 'UWELL Store', 1, '503262087', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-066', 'Al-musafer lish-sheesh wal-moasalat', 'https://maps.app.goo.gl/FbempiM5tJcyFc9a8?g_st=aw', 0, 0, '', 'UWELL Store', 1, '503250666', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-067', 'Smook pls', 'https://maps.app.goo.gl/3SYfhHQ7nTHyPmnT8?g_st=aw', 0, 0, '', 'UWELL Store', 3, '565579445', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-068', 'Al-musafer lish-sheesh', 'https://maps.app.goo.gl/HVFoPEcEygBsLwdM6?g_st=aw', 0, 0, '', 'UWELL Store', 1, '500949513', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-069', 'Sultan lish-sheesh wal-moasalat', 'https://maps.app.goo.gl/ypjzd5ivjPYQ5NkC7?g_st=aw', 0, 0, '', 'UWELL Store', 1, '582683270', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-070', 'Sharikat shumookh al-fakhir', 'https://maps.app.goo.gl/6ejHHXiozeRuecf36?g_st=aw', 0, 0, '', 'UWELL Store', 1, '539310938', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-071', 'Al-musafer', 'https://maps.app.goo.gl/s49U7YJDPFeDy4NU9?g_st=aw', 0, 0, '', 'UWELL Store', 3, '506584666', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-072', 'Sharikat shumookh al-fakhir', 'https://maps.app.goo.gl/MjanbAyKBPxfu6F78?g_st=aw', 0, 0, '', 'UWELL Store', 4, '539310938', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-073', 'Dhaw'' al-ilham lil-moasalat', 'https://maps.app.goo.gl/Bqd8qyjKnDWgxi3m7?g_st=aw', 0, 0, '', 'UWELL Store', 3, '544878912', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-074', 'Smok plus lil-vape wal-moasalat', 'https://maps.app.goo.gl/FLXb7mf5LtjY8Gwh6?g_st=aw', 0, 0, '', 'UWELL Store', 3, '543903337', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-075', 'Oustorat al-atwal lil-moasalat', 'https://maps.app.goo.gl/MVgGR44i6t4oNjgo7?g_st=aw', 0, 0, '', 'UWELL Store', 2, '503413206', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-076', 'Smok plus', 'https://maps.app.goo.gl/yvrpHHtMBYgvFDcR9?g_st=aw', 0, 0, '', 'UWELL Store', 1, '532477285', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-077', 'ALMOSAFR TO TRADE', 'https://maps.app.goo.gl/PVEfLdYzGQsWj6UH9?g_st=aw', 0, 0, '', 'UWELL Store', 1, '571800860', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-078', 'Hadith al-masa', 'https://maps.app.goo.gl/nqNLpPoSKggb9zyv7?g_st=aw', 0, 0, '', 'UWELL Store', 1, '535226877', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-079', 'Nisr al-keif', 'https://maps.app.goo.gl/rU7oSXiJhiQDaAVa6?g_st=aw', 0, 0, '', 'UWELL Store', 1, '507976579', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.stores (id, name, address, lat, lng, level, chain_name, chain_store_count, phone, created_by) VALUES ('s-real-080', 'Sharikat joud al-keif', 'https://maps.app.goo.gl/8uT1iqPGWXvnvWWD8?g_st=aw', 0, 0, '', 'UWELL Store', 1, '508307689', 'e9599b0f-16ce-4f66-b496-617e6863ecec') ON CONFLICT (id) DO NOTHING;
-- Visits (30)
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-001', 's-real-001', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-22', 'completed', 'G4 PRO display looks great, 15 units in stock. Competitor Xlim Pro has poster on door. Placed UWELL door panel sticker and added store to WhatsApp group.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-002', 's-real-002', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-22', 'completed', 'G4 pods out of stock, customer asking for restock urgently. Need to coordinate distributor resupply this week.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-003', 's-real-003', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-22', 'completed', 'UWELL G4 PRO selling 8-12 units/month, pods selling 30-50 units/month. Strong shelf presence, staff knowledgeable about pod systems.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-004', 's-real-004', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-21', 'completed', 'OXVA gaining shelf space, need more POSM. Demonstrated G5 features to staff, strong interest in coil advantage.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-005', 's-real-005', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-21', 'completed', 'Vaporesso pushing hard with new XROS display. UWELL shelf reduced. Scheduled display reset for next visit.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-006', 's-real-006', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-21', 'completed', 'G4 PRO best seller here. Added store owner to UWELL WhatsApp group. 20 G4 pods in stock, healthy inventory.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-007', 's-real-007', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-20', 'completed', 'New fan registered from QR scan! Welcome. UWELL lightbox installed and looks great, drawing customer attention.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-008', 's-real-008', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-20', 'completed', 'Chain store with 3 locations. G4 pods moving fast, restock 50 units requested. Manager very cooperative.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-009', 's-real-009', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-20', 'completed', 'Small store, limited display. Suggested focusing on KOKO entry-level device to attract budget customers.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-010', 's-real-010', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-19', 'completed', 'G5 demo done, owner impressed by flavor. 5 units ordered on spot. Ramadan promo materials placed on counter.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-011', 's-real-011', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-19', 'completed', 'Strong UWELL shelf presence, G4 PRO best seller. Staff trained on pod replacement. Sales up 15% this month.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-012', 's-real-012', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-19', 'completed', 'A-level store, premium location. G5 selling 10+ units/month. Recommended adding KOKO for entry segment.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-013', 's-real-013', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-18', 'completed', 'Competitor watch: Vaporesso XROS 4 launched. Pushed G4 PRO''s superior coil life as key differentiator.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-014', 's-real-014', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-18', 'completed', 'Store display upgraded with UWELL lightbox and acrylic stand. Looks premium. Expect sales lift of 30%.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-015', 's-real-015', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-18', 'completed', 'C-level store struggling. Owner only stocks competitor pods. Left samples and catalog, follow up next week.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-016', 's-real-016', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-17', 'completed', 'Ramadan promo live: buy 2 G4 get 1 pod free. POSM placed. Early sales strong, 8 units sold in 2 days.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-017', 's-real-017', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-17', 'completed', 'G4 pods restocked 60 units. Owner happy with margin. Suggested bundling pods with KOKO device.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-018', 's-real-018', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-17', 'completed', 'WhatsApp community growing - added 3 store staff today. Sharing daily G5 tips and coil care guides.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-019', 's-real-019', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-16', 'completed', 'Store check: G4 PRO 12 units in stock, G5 5 units, pods 40. Display tidy. Placed new A2 poster.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-020', 's-real-020', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-16', 'completed', 'Customer feedback: G4 PRO flavor better than Xlim Pro. Captured testimonial for marketing. Sales steady.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-021', 's-real-021', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-16', 'completed', 'POSM installation complete: door panel + lightbox. Store now looks like flagship UWELL partner.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-022', 's-real-022', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-15', 'completed', 'B-level store improving. After training, staff now recommend UWELL first. Pod attach rate up to 60%.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-023', 's-real-023', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-15', 'completed', 'Stock alert: G5 running low (3 units left). Placed urgent order. G4 PRO healthy at 18 units.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-024', 's-real-024', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-15', 'completed', 'Just Smoke Vape flagship visit. G5 demo event planned for next week. 20+ customers expected.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-025', 's-real-025', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-14', 'completed', 'Holiday foot traffic strong. G4 PRO 9 units sold this week. Ramadan giveaway driving scan registrations.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-026', 's-real-026', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-14', 'completed', 'New competitor poster on window (OXVA Xlim Pro). Replaced with UWELL G5 banner. Maintained visibility.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-027', 's-real-027', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-14', 'completed', 'C-level store. Limited budget. Suggested KOKO + pod bundle as low-risk entry. Owner considering.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-028', 's-real-028', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-13', 'completed', 'A-level store, top performer. G5 15 units/month, G4 PRO 20 units/month. Recommended for VIP program.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-029', 's-real-029', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-13', 'completed', 'Store owner joined WhatsApp group, already asking about G5 restock. Engagement building well.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visits (id, store_id, rep_id, visit_date, status, notes) VALUES ('v-real-030', 's-real-030', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-13', 'completed', 'Monthly visit complete. Sales data collected: 12 G4 PRO, 45 pods sold. Display photos uploaded.') ON CONFLICT (id) DO NOTHING;
-- Visit Sales (70)
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-001', 'v-real-001', 'p-001', 12, 960, 15) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-002', 'v-real-001', 'p-006', 45, 675, 50) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-003', 'v-real-002', 'p-001', 8, 640, 5) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-004', 'v-real-002', 'p-006', 30, 450, 10) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-005', 'v-real-003', 'p-001', 10, 800, 20) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-006', 'v-real-003', 'p-006', 50, 750, 60) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-007', 'v-real-004', 'p-004', 6, 720, 8) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-008', 'v-real-004', 'p-007', 25, 450, 30) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-009', 'v-real-004', 'p-001', 9, 720, 12) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-010', 'v-real-005', 'p-003', 15, 975, 20) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-011', 'v-real-005', 'p-006', 35, 525, 15) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-012', 'v-real-006', 'p-001', 11, 880, 18) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-013', 'v-real-006', 'p-006', 40, 600, 45) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-014', 'v-real-007', 'p-005', 14, 700, 16) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-015', 'v-real-007', 'p-008', 38, 456, 40) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-016', 'v-real-008', 'p-001', 9, 720, 10) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-017', 'v-real-008', 'p-006', 42, 630, 20) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-018', 'v-real-008', 'p-004', 4, 480, 6) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-019', 'v-real-009', 'p-005', 8, 400, 12) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-020', 'v-real-009', 'p-008', 25, 300, 30) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-021', 'v-real-010', 'p-004', 5, 600, 8) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-022', 'v-real-010', 'p-007', 20, 360, 25) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-023', 'v-real-011', 'p-001', 13, 1040, 16) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-024', 'v-real-011', 'p-006', 48, 720, 50) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-025', 'v-real-012', 'p-004', 11, 1320, 9) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-026', 'v-real-012', 'p-007', 30, 540, 35) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-027', 'v-real-012', 'p-005', 7, 350, 10) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-028', 'v-real-013', 'p-001', 10, 800, 14) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-029', 'v-real-013', 'p-006', 38, 570, 40) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-030', 'v-real-014', 'p-001', 12, 960, 18) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-031', 'v-real-014', 'p-004', 6, 720, 8) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-032', 'v-real-014', 'p-006', 45, 675, 50) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-033', 'v-real-015', 'p-005', 5, 250, 8) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-034', 'v-real-015', 'p-008', 18, 216, 20) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-035', 'v-real-016', 'p-003', 14, 910, 16) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-036', 'v-real-016', 'p-006', 50, 750, 55) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-037', 'v-real-017', 'p-001', 9, 720, 22) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-038', 'v-real-017', 'p-006', 55, 825, 60) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-039', 'v-real-017', 'p-008', 20, 240, 25) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-040', 'v-real-018', 'p-005', 10, 500, 14) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-041', 'v-real-018', 'p-008', 30, 360, 35) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-042', 'v-real-019', 'p-001', 12, 960, 18) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-043', 'v-real-019', 'p-006', 42, 630, 45) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-044', 'v-real-020', 'p-004', 7, 840, 10) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-045', 'v-real-020', 'p-007', 28, 504, 30) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-046', 'v-real-021', 'p-001', 11, 880, 15) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-047', 'v-real-021', 'p-006', 44, 660, 48) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-048', 'v-real-021', 'p-004', 5, 600, 7) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-049', 'v-real-022', 'p-001', 10, 800, 16) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-050', 'v-real-022', 'p-006', 40, 600, 42) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-051', 'v-real-023', 'p-004', 3, 360, 5) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-052', 'v-real-023', 'p-007', 22, 396, 25) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-053', 'v-real-023', 'p-001', 8, 640, 12) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-054', 'v-real-024', 'p-004', 12, 1440, 14) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-055', 'v-real-024', 'p-007', 35, 630, 40) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-056', 'v-real-024', 'p-001', 14, 1120, 18) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-057', 'v-real-025', 'p-001', 9, 720, 13) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-058', 'v-real-025', 'p-006', 38, 570, 40) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-059', 'v-real-026', 'p-003', 12, 780, 18) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-060', 'v-real-026', 'p-006', 36, 540, 38) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-061', 'v-real-027', 'p-005', 6, 300, 10) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-062', 'v-real-027', 'p-008', 22, 264, 28) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-063', 'v-real-028', 'p-004', 15, 1800, 12) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-064', 'v-real-028', 'p-007', 40, 720, 45) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-065', 'v-real-028', 'p-001', 20, 1600, 22) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-066', 'v-real-029', 'p-003', 11, 715, 15) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-067', 'v-real-029', 'p-006', 42, 630, 48) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-068', 'v-real-030', 'p-001', 12, 960, 16) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-069', 'v-real-030', 'p-006', 45, 675, 50) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
INSERT INTO public.visit_sales (id, visit_id, product_id, sales_qty, sales_amount, stock_qty) VALUES ('vs-real-070', 'v-real-030', 'p-004', 6, 720, 8) ON CONFLICT (visit_id, product_id) DO UPDATE SET sales_qty=EXCLUDED.sales_qty, sales_amount=EXCLUDED.sales_amount, stock_qty=EXCLUDED.stock_qty;
-- Visit Photos (5)
INSERT INTO public.visit_photos (id, visit_id, photo_type, photo_url) VALUES ('vp-001', 'v-001', 'shelf', 'https://images.unsplash.com/photo-1578916171728-297f8394d7b9?w=400') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visit_photos (id, visit_id, photo_type, photo_url) VALUES ('vp-002', 'v-001', 'display', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visit_photos (id, visit_id, photo_type, photo_url) VALUES ('vp-003', 'v-002', 'exterior', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visit_photos (id, visit_id, photo_type, photo_url) VALUES ('vp-004', 'v-003', 'product', 'https://images.unsplash.com/photo-1626202378011-4b0bf3a99fcd?w=400') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.visit_photos (id, visit_id, photo_type, photo_url) VALUES ('vp-005', 'v-006', 'shelf', 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=400') ON CONFLICT (id) DO NOTHING;
-- Store Evaluations (15)
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-001', 's-real-012', '2026-06-21', 9, 9, 9, 8, 8, 9, 52, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level flagship. Strong UWELL shelf presence, G4 PRO best seller, staff knowledgeable about pod systems. Premium location in Azizia.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-002', 's-real-013', '2026-06-20', 8, 9, 8, 9, 7, 8, 49, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level store. Abraj Alkhalij - great display, cooperative owner. G5 moving 10+ units/month.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-003', 's-real-014', '2026-06-19', 9, 8, 9, 8, 8, 9, 51, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level. Eunwan Almizaj - high foot traffic, strong UWELL presence. Staff well trained on G4 PRO.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-004', 's-real-032', '2026-06-18', 10, 9, 10, 9, 9, 9, 56, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level flagship. Just Smoke Vape - top performer. G5 demo events drive sales. Premium vape destination.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-005', 's-real-035', '2026-06-17', 9, 9, 9, 8, 8, 8, 51, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level. Fata Najd 4 - strong sales, excellent display. KOKO and G4 PRO both moving well.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-006', 's-real-036', '2026-06-16', 8, 8, 9, 9, 7, 8, 49, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level. Husam - very cooperative owner, UWELL-first policy. Pod attach rate 65%.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-007', 's-real-039', '2026-06-15', 9, 9, 8, 8, 8, 9, 51, 'A', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'A-level. Al-kaif al-fakhir - premium store, lightbox installed, G5 best seller.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-008', 's-real-001', '2026-06-14', 6, 7, 7, 7, 6, 7, 40, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Rabie Alkayf - improving after display makeover. G4 PRO 8-12 units/month. Upgraded to A next quarter target.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-009', 's-real-003', '2026-06-13', 7, 6, 7, 6, 6, 6, 38, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Mizaj Almashhur - steady performer. Pods selling 30-50/month. Display needs refresh.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-010', 's-real-007', '2026-06-12', 6, 7, 7, 7, 6, 7, 40, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Amwaj Oasis - lightbox installed, new fan registered. Growing community presence.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-011', 's-real-010', '2026-06-11', 6, 6, 6, 7, 5, 6, 36, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Aemidat Alnakhil - G5 demo well received. Owner interested in upgrade program.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-012', 's-real-025', '2026-06-10', 5, 6, 6, 6, 5, 6, 34, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Mood House - decent sales, needs more POSM. KOKO gaining traction.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-013', 's-real-027', '2026-06-09', 6, 5, 6, 6, 5, 5, 33, 'B', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'B-level. Mizaj Eali - average performer. Suggested lightbox to boost visibility.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-014', 's-real-002', '2026-06-08', 4, 4, 5, 5, 3, 4, 25, 'C', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'C-level. Muteat - small store, G4 pods often out of stock. Needs inventory support.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.store_evaluations (id, store_id, eval_date, score_sales, score_display, score_location, score_cooperation, score_expansion, score_appearance, total_score, recommended_level, evaluator_id, notes) VALUES ('se-real-015', 's-real-005', '2026-06-07', 3, 4, 4, 5, 3, 4, 23, 'C', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'C-level. Rihlat Zaman - competitor heavy. Vaporesso dominating shelf. Needs display reset.') ON CONFLICT (id) DO NOTHING;
-- Campaigns (5)
INSERT INTO public.campaigns (id, name, type, start_date, end_date, status, description, target_stores, budget, actual_cost) VALUES ('ca-real-001', 'G5 Launch Promotion', '新品上市', '2026-06-03', '2026-06-18', 'completed', 'G5 flagship device launch campaign targeting A-level stores. Demo events, staff training, and POSM rollout. Goal: establish G5 as premium pod system in market.', '["s-real-012", "s-real-013", "s-real-014", "s-real-032", "s-real-035", "s-real-036", "s-real-039"]'::jsonb, 25000, 21800) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, name, type, start_date, end_date, status, description, target_stores, budget, actual_cost) VALUES ('ca-real-002', 'Ramadan Vape Giveaway', '节日营销', '2026-06-08', '2026-06-21', 'completed', 'Ramadan holiday promotion: buy 2 G4 devices get 1 pod free. QR scan earns double points. Covered A and B level stores across Riyadh.', '["s-real-012", "s-real-013", "s-real-014", "s-real-032", "s-real-035", "s-real-036", "s-real-039", "s-real-001", "s-real-003", "s-real-004", "s-real-006", "s-real-007", "s-real-008", "s-real-010", "s-real-011"]'::jsonb, 18000, 16500) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, name, type, start_date, end_date, status, description, target_stores, budget, actual_cost) VALUES ('ca-real-003', 'Store Display Upgrade Program', '渠道建设', '2026-06-13', '2026-07-13', 'ongoing', 'Provide UWELL lightbox + acrylic stand to top 20 stores. Goal: increase shelf visibility and brand presence. Stores with lightbox sell 2.3x more.', '["s-real-012", "s-real-013", "s-real-014", "s-real-032", "s-real-035", "s-real-036", "s-real-039", "s-real-001", "s-real-003", "s-real-004", "s-real-006", "s-real-007", "s-real-008", "s-real-010", "s-real-011", "s-real-016", "s-real-020", "s-real-022", "s-real-024", "s-real-025"]'::jsonb, 30000, 14200) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, name, type, start_date, end_date, status, description, target_stores, budget, actual_cost) VALUES ('ca-real-004', 'WhatsApp Community Build', '社群运营', '2026-05-24', '2026-08-22', 'ongoing', 'Add all store owners and key staff to UWELL WhatsApp groups. Daily G5 tips, coil care guides, and competitor intel sharing. Build loyal community.', '["s-real-012", "s-real-013", "s-real-014", "s-real-032", "s-real-035", "s-real-036", "s-real-039", "s-real-001", "s-real-003", "s-real-004", "s-real-006", "s-real-007", "s-real-008", "s-real-010", "s-real-011", "s-real-016", "s-real-020", "s-real-022", "s-real-024", "s-real-025", "s-real-026", "s-real-027", "s-real-029", "s-real-030", "s-real-002", "s-real-005", "s-real-009", "s-real-015", "s-real-017"]'::jsonb, 5000, 1200) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaigns (id, name, type, start_date, end_date, status, description, target_stores, budget, actual_cost) VALUES ('ca-real-005', 'Summer Pod Promotion', '促销活动', '2026-06-20', '2026-07-18', 'ongoing', 'Discount on G4 pods (12 SAR instead of 15) targeting B/C stores. Drive pod attach rate and recruit new UWELL users. Bundle KOKO device with pod multipack.', '["s-real-001", "s-real-003", "s-real-004", "s-real-006", "s-real-007", "s-real-008", "s-real-010", "s-real-011", "s-real-016", "s-real-020", "s-real-022", "s-real-024", "s-real-025", "s-real-026", "s-real-027", "s-real-029", "s-real-030", "s-real-002", "s-real-005", "s-real-009", "s-real-015", "s-real-017", "s-real-018", "s-real-019", "s-real-021", "s-real-023", "s-real-028"]'::jsonb, 12000, 3200) ON CONFLICT (id) DO NOTHING;
-- Campaign Tasks (7)
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-001', 'ca-001', '制作夏季促销海报', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-11', 'done') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-002', 'ca-001', '门店展架布置', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-12', 'done') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-003', 'ca-001', '试用装分发', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-13', 'done') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-004', 'ca-002', '试吃台搭建', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-21T05:31:12.402Z', 'done') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-005', 'ca-002', '每日动销数据收集', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-23', 'ongoing') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-006', 'ca-003', '礼盒样品确认', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-26', 'pending') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.campaign_tasks (id, campaign_id, title, assignee_id, due_date, status) VALUES ('ct-007', 'ca-003', '扫码积分码库生成', 'e9599b0f-16ce-4f66-b496-617e6863ecec', '2026-06-25', 'pending') ON CONFLICT (id) DO NOTHING;
-- Campaign Reports (1)
INSERT INTO public.campaign_reports (id, campaign_id, report_date, total_sales, total_visits, total_scans, total_participants, achievement_rate, summary, improvements) VALUES ('cr-001', 'ca-001', '2026-06-20', 12500, 45, 320, 5, 105, '夏季清凉饮品促销周圆满结束，5家门店参与，总销售额12500元，超额完成5%。橙汁和矿泉水动销最佳，展架陈列效果显著。建议后续类似活动继续采用试吃+买赠组合策略。', '1. 部分门店补货不够及时，下次需提前协调库存；2. 试用装消耗超预期，需增加备货；3. 可考虑增加线上扫码领券引流到店。') ON CONFLICT (id) DO NOTHING;
-- Fans (8)
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-001', 's-001', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'gold', 580, 580) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-002', 's-002', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'platinum', 2300, 2300) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-003', 's-003', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'silver', 150, 150) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-004', 's-004', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'gold', 520, 520) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-005', 's-005', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'bronze', 30, 30) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-006', 's-006', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'silver', 120, 120) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-007', 's-007', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'diamond', 5200, 5200) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.fans (id, store_id, user_id, level, points, total_contribution) VALUES ('f-008', 's-008', 'e9599b0f-16ce-4f66-b496-617e6863ecec', 'bronze', 15, 15) ON CONFLICT (id) DO NOTHING;
-- Fan Points Log (24)
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-001', 'f-001', 10, 'earn', '完成拜访', '完成门店拜访 s-001');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-002', 'f-001', 5, 'earn', '上传照片', '拜访上传货架照片');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-003', 'f-001', 5, 'earn', '提交动销数据', '提交动销数据3条');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-004', 'f-002', 10, 'earn', '完成拜访', '完成门店拜访 s-002');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-005', 'f-002', 50, 'earn', '扫码积分', '消费者扫码 p-002 x10');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-006', 'f-007', 100, 'earn', '扫码积分', '消费者扫码 p-001 x20');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-007', 'f-007', 30, 'redeem', '兑换奖励', '兑换精美水杯一个');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-008', 'f-004', 10, 'earn', '完成拜访', '完成门店拜访 s-004');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-001', 'f-001', 10, 'earn', '完成拜访', '完成门店拜访 s-real-001 (rabie alkayf)');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-002', 'f-001', 5, 'earn', '扫码积分', '消费者扫码 G4 PRO x10');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-003', 'f-001', 5, 'earn', '签到奖励', '每日签到 +5');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-004', 'f-002', 10, 'earn', '完成拜访', '完成门店拜访 s-real-002 (muteat)');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-005', 'f-002', 30, 'earn', '推荐新粉丝', '推荐 Amwaj Oasis 店主注册');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-006', 'f-007', 50, 'earn', '扫码积分', 'G5 demo event 扫码 x10');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-007', 'f-007', 10, 'earn', '完成拜访', '完成 Just Smoke Vape 拜访');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-008', 'f-007', 5, 'earn', '签到奖励', '连续签到7天 +5');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-009', 'f-004', 30, 'earn', '推荐新粉丝', '推荐 3 位新粉丝注册');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-010', 'f-004', 5, 'earn', '扫码积分', 'KOKO 扫码 x5');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-011', 'f-001', 30, 'earn', '推荐新粉丝', '推荐 rabie alkayf 升级为 A 级门店');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-012', 'f-003', 10, 'earn', '完成拜访', '完成门店拜访 s-real-003');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-013', 'f-003', 5, 'earn', '签到奖励', '每日签到 +5');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-014', 'f-006', 5, 'earn', '扫码积分', 'G4 Pod 扫码 x3');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-015', 'f-007', 30, 'redeem', '兑换奖励', '兑换 UWELLCare 礼品包');
INSERT INTO public.fan_points_log (id, fan_id, points, type, source, description) VALUES ('fpl-real-016', 'f-002', 5, 'earn', '签到奖励', '每日签到 +5');
-- QR Codes (17)
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-001', 'p-001', 'QR-COLA-001', 's-001', 5, 28, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-002', 'p-002', 'QR-ORANGE-001', 's-002', 5, 52, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-003', 'p-003', 'QR-CHIPS-001', 's-007', 5, 45, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-004', 'p-005', 'QR-WATER-001', 's-001', 5, 33, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-005', 'p-004', 'QR-CHOC-001', 's-004', 5, 12, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-001', 'p-001', 'QR-G4PRO-001', 's-real-012', 5, 86, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-002', 'p-004', 'QR-G5-001', 's-real-032', 5, 64, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-003', 'p-003', 'QR-G4-001', 's-real-001', 5, 52, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-004', 'p-005', 'QR-KOKO-001', 's-real-007', 5, 41, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-005', 'p-006', 'QR-PODG4-001', 's-real-014', 5, 73, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-006', 'p-007', 'QR-PODG5-001', 's-real-035', 5, 38, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-007', 'p-008', 'QR-PODKOKO-001', 's-real-025', 5, 29, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-008', 'p-001', 'QR-G4PRO-002', 's-real-039', 5, 47, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-009', 'p-004', 'QR-G5-002', 's-real-013', 5, 33, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-010', 'p-003', 'QR-G4-002', 's-real-027', 5, 21, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-011', 'p-005', 'QR-KOKO-002', 's-real-009', 5, 18, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.qr_codes (id, product_id, code, store_id, points, scan_count, is_active) VALUES ('qr-real-012', 'p-006', 'QR-PODG4-002', 's-real-036', 5, 55, true) ON CONFLICT (id) DO NOTHING;
-- Scan Records (7)
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-001', 'qr-001', 'f-001', 'p-001', 's-001', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-002', 'qr-002', 'f-002', 'p-002', 's-002', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-003', 'qr-003', 'f-007', 'p-003', 's-007', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-004', 'qr-001', 'f-001', 'p-001', 's-001', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-005', 'qr-002', 'f-002', 'p-002', 's-002', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-006', 'qr-004', 'f-001', 'p-005', 's-001', 5);
INSERT INTO public.scan_records (id, qr_code_id, fan_id, product_id, store_id, points_earned) VALUES ('sr-007', 'qr-003', 'f-007', 'p-003', 's-007', 5);
-- Community Comments (20)
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-001', 'cp-real-001', 'Ahmed K.', 'Amazing! Which stores? I want to follow up with demo units.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-002', 'cp-real-001', 'Khalid R.', 'Great work team 💪 G5 will be a game changer.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-003', 'cp-real-002', 'Salem M.', 'Agreed. G4 PRO coil lasts 30% longer. That''s our key talking point.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-004', 'cp-real-002', 'Fatima A.', 'I will update the competitor matrix and share with all reps.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-005', 'cp-real-003', 'Robin C.', 'This is the model! Lightbox + training = results.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-006', 'cp-real-003', 'Khalid R.', 'Can we replicate this at 5 more B-level stores?') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-007', 'cp-real-004', 'Ahmed K.', 'Exceeded target by 15%. Ramadan timing was perfect.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-008', 'cp-real-004', 'Salem M.', '15 new fans in one campaign - community is growing!') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-009', 'cp-real-005', 'Robin C.', 'On it. Coordinating with distributor today, delivery Thursday.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-010', 'cp-real-006', 'Fatima A.', 'Data speaks! Adding lightbox to Q3 budget request.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-011', 'cp-real-006', 'Khalid R.', 'Just installed 3 more this week. Owners love the premium look.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-012', 'cp-real-007', 'Salem M.', 'Leave samples + catalog, then follow up weekly. Patience wins.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-013', 'cp-real-007', 'Robin C.', 'Offer consignment stock for first month - lowers their risk.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-014', 'cp-real-008', 'Ahmed K.', '8 on-spot purchases! Conversion rate is solid.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-015', 'cp-real-008', 'Fatima A.', 'Planning 3 more demo events at A-level stores next month.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-016', 'cp-real-009', 'Khalid R.', 'Welcome to the UWELL family! 🎉') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-017', 'cp-real-010', 'Salem M.', '10 to A-level is ambitious but doable. Focus on display upgrades.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-018', 'cp-real-010', 'Robin C.', 'I have 3 B-level stores ready to upgrade. Will push hard this quarter.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-019', 'cp-real-011', 'Ahmed K.', 'Pro-FOCS is our secret weapon. Customers notice instantly.') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.community_comments (id, post_id, author_name, content) VALUES ('cc-real-020', 'cp-real-012', 'Fatima A.', '60+ owners! The daily tips are really driving engagement.') ON CONFLICT (id) DO NOTHING;
-- Material Inbound (4)
INSERT INTO public.material_inbound (id, material_id, qty, operator_id, notes) VALUES ('mi-001', 'm-001', 500, 'e9599b0f-16ce-4f66-b496-617e6863ecec', '首批海报印制') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_inbound (id, material_id, qty, operator_id, notes) VALUES ('mi-002', 'm-002', 30, 'e9599b0f-16ce-4f66-b496-617e6863ecec', '展架采购入库') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_inbound (id, material_id, qty, operator_id, notes) VALUES ('mi-003', 'm-003', 1000, 'e9599b0f-16ce-4f66-b496-617e6863ecec', '试用装大批量入库') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_inbound (id, material_id, qty, operator_id, notes) VALUES ('mi-004', 'm-004', 50, 'e9599b0f-16ce-4f66-b496-617e6863ecec', '工服换季采购') ON CONFLICT (id) DO NOTHING;
-- Material Outbound (5)
INSERT INTO public.material_outbound (id, material_id, qty, applicant_id, store_id, status, reason) VALUES ('mo-001', 'm-001', 50, 'e9599b0f-16ce-4f66-b496-617e6863ecec', 's-001', 'delivered', '门店宣传海报更新') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_outbound (id, material_id, qty, applicant_id, store_id, status, reason) VALUES ('mo-002', 'm-002', 3, 'e9599b0f-16ce-4f66-b496-617e6863ecec', 's-002', 'delivered', '产品展架更换') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_outbound (id, material_id, qty, applicant_id, store_id, status, reason) VALUES ('mo-003', 'm-003', 100, 'e9599b0f-16ce-4f66-b496-617e6863ecec', 's-001', 'approved', '周末促销试用装') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_outbound (id, material_id, qty, applicant_id, store_id, status, reason) VALUES ('mo-004', 'm-004', 5, 'e9599b0f-16ce-4f66-b496-617e6863ecec', 's-005', 'pending', '新员工工服') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.material_outbound (id, material_id, qty, applicant_id, store_id, status, reason) VALUES ('mo-005', 'm-006', 10, 'e9599b0f-16ce-4f66-b496-617e6863ecec', 's-007', 'pending', '高端社区促销立牌') ON CONFLICT (id) DO NOTHING;
-- ===== DONE =====
