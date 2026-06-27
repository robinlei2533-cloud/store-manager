-- ============ UWELL CRM Supabase Schema ============
-- Run this SQL in Supabase SQL Editor to create all tables
-- ===================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (order matters due to FK)
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.mall_redemptions CASCADE;
DROP TABLE IF EXISTS public.lottery_records CASCADE;
DROP TABLE IF EXISTS public.fan_checkins CASCADE;
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
DROP TABLE IF EXISTS public.photos CASCADE;
DROP TABLE IF EXISTS public.store_tasks CASCADE;
DROP TABLE IF EXISTS public.campaign_claims CASCADE;
DROP TABLE IF EXISTS public.campaign_reviews CASCADE;

-- ============ 1. Profiles (用户/角色) ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT DEFAULT 'fan' CHECK (role IN ('admin','manager','rep','fan')),
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 2. Products (产品) ============
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 3. Stores (门店) ============
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  level TEXT DEFAULT 'C' CHECK (level IN ('S','A','B','C')),
  chain_name TEXT,
  chain_id TEXT,
  chain_store_count INT DEFAULT 1,
  contact TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 4. Visits (拜访) ============
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  rep_id UUID REFERENCES public.profiles(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('planned','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 5. Visit Sales (拜访销售) ============
CREATE TABLE IF NOT EXISTS public.visit_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INT DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 6. Visit Photos (拜访照片) ============
CREATE TABLE IF NOT EXISTS public.visit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 7. Fans (粉丝) ============
CREATE TABLE IF NOT EXISTS public.fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  user_id UUID REFERENCES public.profiles(id),
  name TEXT,
  phone TEXT,
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  points INT DEFAULT 0,
  total_contribution INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 8. Fan Points Log (积分流水) ============
CREATE TABLE IF NOT EXISTS public.fan_points_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES public.fans(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem','expire')),
  source TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 9. Fan Points Rules (积分规则) ============
CREATE TABLE IF NOT EXISTS public.fan_points_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  points INT NOT NULL,
  type TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 10. Fan Level Rules (等级规则) ============
CREATE TABLE IF NOT EXISTS public.fan_level_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  min_points INT NOT NULL,
  color TEXT,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 11. Materials (物料) ============
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  unit TEXT DEFAULT 'pcs',
  unit_cost NUMERIC(10,2) DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 12. Material Stocks (物料库存) ============
CREATE TABLE IF NOT EXISTS public.material_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id),
  store_id UUID REFERENCES public.stores(id),
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, store_id)
);

-- ============ 13. Material Inbound (物料入库) ============
CREATE TABLE IF NOT EXISTS public.material_inbound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id),
  store_id UUID REFERENCES public.stores(id),
  quantity INT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 14. Material Outbound (物料出库) ============
CREATE TABLE IF NOT EXISTS public.material_outbound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES public.materials(id),
  store_id UUID REFERENCES public.stores(id),
  quantity INT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 15. Store Evaluations (店铺评估) ============
CREATE TABLE IF NOT EXISTS public.store_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  rep_id UUID REFERENCES public.profiles(id),
  overall_score INT CHECK (overall_score BETWEEN 1 AND 100),
  shelf_score INT CHECK (shelf_score BETWEEN 1 AND 10),
  stock_score INT CHECK (stock_score BETWEEN 1 AND 10),
  promo_score INT CHECK (promo_score BETWEEN 1 AND 10),
  cleanliness INT CHECK (cleanliness BETWEEN 1 AND 10),
  staff_knowledge INT CHECK (staff_knowledge BETWEEN 1 AND 10),
  notes TEXT,
  visit_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 16. Campaigns (活动) ============
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','ongoing','completed','cancelled')),
  description TEXT,
  target_stores TEXT[],
  budget NUMERIC(12,2) DEFAULT 0,
  actual_cost NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 17. Campaign Tasks (活动任务) ============
CREATE TABLE IF NOT EXISTS public.campaign_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 18. Campaign Reports (活动报告) ============
CREATE TABLE IF NOT EXISTS public.campaign_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id),
  rep_id UUID REFERENCES public.profiles(id),
  materials_used INT DEFAULT 0,
  effect TEXT,
  feedback TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 19. QR Codes (二维码) ============
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  product_id UUID REFERENCES public.products(id),
  code TEXT UNIQUE,
  scan_limit INT DEFAULT 3,
  scan_count INT DEFAULT 0,
  points_per_scan INT DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 20. Scan Records (扫码记录) ============
CREATE TABLE IF NOT EXISTS public.scan_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES public.qr_codes(id),
  fan_id UUID REFERENCES public.fans(id),
  store_id UUID REFERENCES public.stores(id),
  points_earned INT DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 21. Fan Checkins (签到) ============
CREATE TABLE IF NOT EXISTS public.fan_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES public.fans(id) ON DELETE CASCADE,
  checkin_date DATE DEFAULT CURRENT_DATE,
  points_earned INT DEFAULT 5,
  streak_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fan_id, checkin_date)
);

-- ============ 22. Lottery Records (抽奖) ============
CREATE TABLE IF NOT EXISTS public.lottery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES public.fans(id) ON DELETE CASCADE,
  type TEXT,
  prize TEXT,
  points_cost INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 23. Mall Redemptions (积分兑换) ============
CREATE TABLE IF NOT EXISTS public.mall_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES public.fans(id) ON DELETE CASCADE,
  product_name TEXT,
  points_spent INT DEFAULT 0,
  quantity INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 24. Community Posts (社区帖子) ============
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID REFERENCES public.fans(id),
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 25. Community Comments (社区评论) ============
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  fan_id UUID REFERENCES public.fans(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 26. Store Tasks (门店任务) ============
CREATE TABLE IF NOT EXISTS public.store_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id),
  assignee_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 27. Photos (通用照片表) ============
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 28. Campaign Claims (活动领取) ============
CREATE TABLE IF NOT EXISTS public.campaign_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id),
  store_id UUID REFERENCES public.stores(id),
  fan_id UUID REFERENCES public.fans(id),
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed','fulfilled','cancelled')),
  claimed_at TIMESTAMPTZ DEFAULT now()
);

-- ============ 29. Campaign Reviews (活动复盘) ============
CREATE TABLE IF NOT EXISTS public.campaign_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id),
  store_id UUID REFERENCES public.stores(id),
  materials_used INT DEFAULT 0,
  effect TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_stores_level ON public.stores(level);
CREATE INDEX IF NOT EXISTS idx_stores_chain ON public.stores(chain_name);
CREATE INDEX IF NOT EXISTS idx_visits_store ON public.visits(store_id);
CREATE INDEX IF NOT EXISTS idx_visits_rep ON public.visits(rep_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_fans_store ON public.fans(store_id);
CREATE INDEX IF NOT EXISTS idx_fans_level ON public.fans(level);
CREATE INDEX IF NOT EXISTS idx_fan_points_log_fan ON public.fan_points_log(fan_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_fan ON public.scan_records(fan_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_store ON public.scan_records(store_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_material_stocks_store ON public.material_stocks(store_id);
CREATE INDEX IF NOT EXISTS idx_store_evaluations_store ON public.store_evaluations(store_id);

-- ============ Row Level Security ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_stocks ENABLE ROW LEVEL SECURITY;
