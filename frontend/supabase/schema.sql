-- ============================================================
-- UWELL CRM — Supabase Database Schema
-- Generated from seedData.js structure
-- ============================================================

-- 1. Profiles (用户档案)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','rep','store_owner','fan')),
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products (产品库)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Stores (门店)
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  level TEXT DEFAULT 'C' CHECK (level IN ('S','A','B','C','platinum','gold','silver','bronze')),
  chain_name TEXT,
  chain_id TEXT,
  chain_store_count INTEGER DEFAULT 0,
  contact TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visits (拜访记录)
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES stores(id),
  rep_id TEXT REFERENCES profiles(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Visit Sales (拜访销售数据)
CREATE TABLE IF NOT EXISTS visit_sales (
  id TEXT PRIMARY KEY,
  visit_id TEXT REFERENCES visits(id),
  product_id TEXT REFERENCES products(id),
  qty INTEGER DEFAULT 0,
  unit_price NUMERIC(10,2) DEFAULT 0
);

-- 6. Visit Photos (拜访照片)
CREATE TABLE IF NOT EXISTS visit_photos (
  id TEXT PRIMARY KEY,
  visit_id TEXT REFERENCES visits(id),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Fans (粉丝)
CREATE TABLE IF NOT EXISTS fans (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES stores(id),
  user_id TEXT REFERENCES profiles(id),
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  points INTEGER DEFAULT 0,
  total_contribution INTEGER DEFAULT 0,
  last_checkin DATE,
  checkin_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Fan Points Log (粉丝积分日志)
CREATE TABLE IF NOT EXISTS fan_points_log (
  id TEXT PRIMARY KEY,
  fan_id TEXT REFERENCES fans(id),
  points INTEGER NOT NULL,
  reason TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Fan Points Rules (积分规则)
CREATE TABLE IF NOT EXISTS fan_points_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  max_daily INTEGER,
  description TEXT,
  active BOOLEAN DEFAULT true
);

-- 10. Fan Level Rules (等级规则)
CREATE TABLE IF NOT EXISTS fan_level_rules (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL UNIQUE CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  min_points INTEGER NOT NULL,
  benefits TEXT
);

-- 11. Materials (物料)
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT,
  unit TEXT DEFAULT '个',
  category TEXT,
  safety_stock INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Material Stocks (物料库存)
CREATE TABLE IF NOT EXISTS material_stocks (
  id TEXT PRIMARY KEY,
  material_id TEXT REFERENCES materials(id),
  store_id TEXT REFERENCES stores(id),
  qty INTEGER DEFAULT 0,
  safety_stock INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Material Inbound (物料入库)
CREATE TABLE IF NOT EXISTS material_inbound (
  id TEXT PRIMARY KEY,
  material_id TEXT REFERENCES materials(id),
  store_id TEXT REFERENCES stores(id),
  qty INTEGER NOT NULL,
  operator_id TEXT REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Material Outbound (物料出库)
CREATE TABLE IF NOT EXISTS material_outbound (
  id TEXT PRIMARY KEY,
  material_id TEXT REFERENCES materials(id),
  store_id TEXT REFERENCES stores(id),
  qty INTEGER NOT NULL,
  operator_id TEXT REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Store Evaluations (店铺评估)
CREATE TABLE IF NOT EXISTS store_evaluations (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES stores(id),
  rep_id TEXT REFERENCES profiles(id),
  visit_id TEXT REFERENCES visits(id),
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10),
  shelf_display INTEGER CHECK (shelf_display >= 1 AND shelf_display <= 5),
  brand_visibility INTEGER CHECK (brand_visibility >= 1 AND brand_visibility <= 5),
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  staff_knowledge INTEGER CHECK (staff_knowledge >= 1 AND staff_knowledge <= 5),
  promo_material INTEGER CHECK (promo_material >= 1 AND promo_material <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Campaigns (活动)
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard','promotion','event','seasonal')),
  target_stores TEXT[],
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Campaign Tasks (活动任务)
CREATE TABLE IF NOT EXISTS campaign_tasks (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  assigned_to TEXT REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Campaign Claims (活动领取)
CREATE TABLE IF NOT EXISTS campaign_claims (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  store_id TEXT REFERENCES stores(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','delivered')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES profiles(id)
);

-- 19. Campaign Reports (活动复盘)
CREATE TABLE IF NOT EXISTS campaign_reports (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  store_id TEXT REFERENCES stores(id),
  materials_used INTEGER DEFAULT 0,
  effect TEXT,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by TEXT REFERENCES profiles(id)
);

-- 20. QR Codes (二维码)
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES stores(id),
  product_id TEXT REFERENCES products(id),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Scan Records (扫码记录)
CREATE TABLE IF NOT EXISTS scan_records (
  id TEXT PRIMARY KEY,
  qr_code_id TEXT REFERENCES qr_codes(id),
  fan_id TEXT REFERENCES fans(id),
  store_id TEXT REFERENCES stores(id),
  points_earned INTEGER DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Community Posts (社区帖子)
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  fan_id TEXT REFERENCES fans(id),
  title TEXT,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Community Comments (社区评论)
CREATE TABLE IF NOT EXISTS community_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES community_posts(id),
  fan_id TEXT REFERENCES fans(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_visits_store_id ON visits(store_id);
CREATE INDEX IF NOT EXISTS idx_visits_rep_id ON visits(rep_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_fans_store_id ON fans(store_id);
CREATE INDEX IF NOT EXISTS idx_fan_points_log_fan_id ON fan_points_log(fan_id);
CREATE INDEX IF NOT EXISTS idx_material_stocks_store_id ON material_stocks(store_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_fan_id ON scan_records(fan_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_store_id ON scan_records(store_id);
CREATE INDEX IF NOT EXISTS idx_campaign_claims_store_id ON campaign_claims(store_id);
CREATE INDEX IF NOT EXISTS idx_store_evaluations_store_id ON store_evaluations(store_id);

-- ============================================================
-- RPC Functions (used by dashboard)
-- ============================================================
CREATE OR REPLACE FUNCTION get_low_stock_count()
RETURNS INTEGER LANGUAGE SQL AS \$\$
  SELECT COUNT(*) FROM material_stocks ms
  JOIN materials m ON ms.material_id = m.id
  WHERE ms.qty <= COALESCE(m.safety_stock, 0);
\$\$;

CREATE OR REPLACE FUNCTION get_visit_trend(days_count INTEGER DEFAULT 30)
RETURNS TABLE(visit_date DATE, count BIGINT) LANGUAGE SQL AS \$\$
  SELECT v.visit_date::DATE, COUNT(*)::BIGINT
  FROM visits v
  WHERE v.visit_date >= CURRENT_DATE - days_count
  GROUP BY v.visit_date::DATE
  ORDER BY v.visit_date::DATE;
\$\$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles read own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Stores read all" ON stores FOR SELECT USING (true);
CREATE POLICY "Stores write admin" ON stores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Visits read own rep" ON visits FOR SELECT USING (auth.uid() = rep_id OR auth.role() IN ('admin','manager'));
CREATE POLICY "Fans read own" ON fans FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('admin','manager','rep'));
