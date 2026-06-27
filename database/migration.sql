-- ============================================================
-- 门店管理与运营平台 — 数据库迁移脚本
-- 适用: Supabase (PostgreSQL 15+)
-- 执行方式: Supabase Dashboard > SQL Editor > 粘贴执行
-- ============================================================

-- ============================================================
-- 1. 扩展
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. 用户档案表 (关联 Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'rep' CHECK (role IN ('admin', 'manager', 'rep', 'fan')),
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'rep'),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. 门店表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  level TEXT DEFAULT '' CHECK (level IN ('', 'A', 'B', 'C')),
  chain_name TEXT DEFAULT '',
  chain_id UUID DEFAULT NULL,
  chain_store_count INTEGER DEFAULT 0,
  contact TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. 拜访记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rep_id UUID NOT NULL REFERENCES auth.users(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. 产品库表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT '',
  unit_price DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. 动销数据表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visit_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  sales_qty INTEGER DEFAULT 0,
  sales_amount DOUBLE PRECISION DEFAULT 0,
  stock_qty INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(visit_id, product_id)
);

-- ============================================================
-- 7. 拜访照片表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visit_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL DEFAULT 'product' CHECK (photo_type IN ('shelf', 'display', 'exterior', 'product')),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. 粉丝档案表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  level TEXT NOT NULL DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  points INTEGER NOT NULL DEFAULT 0,
  total_contribution INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. 积分流水表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fan_points_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID NOT NULL REFERENCES public.fans(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  source TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. 积分规则表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fan_points_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. 等级规则表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fan_level_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL UNIQUE CHECK (level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  min_points INTEGER NOT NULL,
  benefits TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. 物料目录表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT '',
  unit TEXT DEFAULT '个',
  unit_cost DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. 物料库存表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  warehouse TEXT NOT NULL DEFAULT '默认仓库',
  qty INTEGER NOT NULL DEFAULT 0,
  safety_stock INTEGER NOT NULL DEFAULT 10,
  UNIQUE(material_id, warehouse)
);

-- ============================================================
-- 14. 物料入库表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_inbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES public.materials(id),
  qty INTEGER NOT NULL,
  operator_id UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 15. 物料出库/领用表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.material_outbound (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES public.materials(id),
  qty INTEGER NOT NULL,
  applicant_id UUID NOT NULL REFERENCES auth.users(id),
  store_id UUID REFERENCES public.stores(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')),
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 16. 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stores_level ON public.stores(level);
CREATE INDEX IF NOT EXISTS idx_stores_chain_id ON public.stores(chain_id);
CREATE INDEX IF NOT EXISTS idx_visits_store_id ON public.visits(store_id);
CREATE INDEX IF NOT EXISTS idx_visits_rep_id ON public.visits(rep_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visit_sales_visit_id ON public.visit_sales(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_photos_visit_id ON public.visit_photos(visit_id);
CREATE INDEX IF NOT EXISTS idx_fans_level ON public.fans(level);
CREATE INDEX IF NOT EXISTS idx_fans_points ON public.fans(points DESC);
CREATE INDEX IF NOT EXISTS idx_fan_points_log_fan_id ON public.fan_points_log(fan_id);
CREATE INDEX IF NOT EXISTS idx_material_stocks_material_id ON public.material_stocks(material_id);
CREATE INDEX IF NOT EXISTS idx_material_inbound_material_id ON public.material_inbound(material_id);
CREATE INDEX IF NOT EXISTS idx_material_outbound_material_id ON public.material_outbound(material_id);
CREATE INDEX IF NOT EXISTS idx_material_outbound_status ON public.material_outbound(status);

-- ============================================================
-- 17. 触发器: 物料入库自动更新库存
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_material_inbound()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.material_stocks (material_id, warehouse, qty)
  VALUES (NEW.material_id, '默认仓库', NEW.qty)
  ON CONFLICT (material_id, warehouse)
  DO UPDATE SET qty = material_stocks.qty + NEW.qty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_material_inbound ON public.material_inbound;
CREATE TRIGGER on_material_inbound
  AFTER INSERT ON public.material_inbound
  FOR EACH ROW EXECUTE FUNCTION public.handle_material_inbound();

-- ============================================================
-- 18. 触发器: 物料出库审批通过后自动扣减库存
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_material_outbound_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.material_stocks
    SET qty = qty - NEW.qty
    WHERE material_id = NEW.material_id AND warehouse = '默认仓库';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_material_outbound_approval ON public.material_outbound;
CREATE TRIGGER on_material_outbound_approval
  AFTER UPDATE ON public.material_outbound
  FOR EACH ROW EXECUTE FUNCTION public.handle_material_outbound_approval();

-- ============================================================
-- 19. 触发器: 积分变动时自动更新粉丝等级
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_fan_level_upgrade()
RETURNS TRIGGER AS $$
DECLARE
  new_level TEXT;
BEGIN
  SELECT level INTO new_level
  FROM public.fan_level_rules
  WHERE min_points <= NEW.points
  ORDER BY min_points DESC
  LIMIT 1;

  IF new_level IS NOT NULL AND new_level != OLD.level THEN
    NEW.level = new_level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_fan_points_change ON public.fans;
CREATE TRIGGER on_fan_points_change
  BEFORE UPDATE ON public.fans
  FOR EACH ROW
  WHEN (OLD.points IS DISTINCT FROM NEW.points)
  EXECUTE FUNCTION public.handle_fan_level_upgrade();

-- ============================================================
-- 20. 触发器: 物料创建时自动初始化库存
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_material()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.material_stocks (material_id, warehouse, qty)
  VALUES (NEW.id, '默认仓库', 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_material_created ON public.materials;
CREATE TRIGGER on_material_created
  AFTER INSERT ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_material();

-- ============================================================
-- 21. RPC 函数: 获取低库存物料数
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_low_stock_count()
RETURNS INTEGER AS $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM public.material_stocks
  WHERE qty <= safety_stock;
  RETURN cnt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 22. RPC 函数: 获取拜访趋势
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_visit_trend(days_count INTEGER DEFAULT 30)
RETURNS TABLE(visit_date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT v.visit_date, COUNT(*)::BIGINT
  FROM public.visits v
  WHERE v.visit_date >= CURRENT_DATE - days_count
  GROUP BY v.visit_date
  ORDER BY v.visit_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 23. RLS 策略 (Row Level Security)
-- ============================================================

-- Profiles: 所有人可查看，仅本人和管理员可修改
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stores: 所有人可查看，admin/manager/rep 可增改
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_select" ON public.stores
  FOR SELECT USING (true);

CREATE POLICY "stores_insert" ON public.stores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'rep'))
  );

CREATE POLICY "stores_update" ON public.stores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'rep'))
  );

CREATE POLICY "stores_delete" ON public.stores
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Visits: 所有人可查看，rep 只能修改自己的
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_select" ON public.visits
  FOR SELECT USING (true);

CREATE POLICY "visits_insert" ON public.visits
  FOR INSERT WITH CHECK (auth.uid() = rep_id);

CREATE POLICY "visits_update" ON public.visits
  FOR UPDATE USING (auth.uid() = rep_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products: 所有人可查看，仅 admin 可管理
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Visit Sales: 继承 visits 的权限
ALTER TABLE public.visit_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visit_sales_all" ON public.visit_sales FOR ALL USING (true);

-- Visit Photos: 继承 visits 的权限
ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visit_photos_all" ON public.visit_photos FOR ALL USING (true);

-- Fans: 所有人可查看，admin/manager 可管理
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fans_select" ON public.fans FOR SELECT USING (true);
CREATE POLICY "fans_all" ON public.fans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Fan Points Log: 所有人可查看
ALTER TABLE public.fan_points_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fan_points_log_select" ON public.fan_points_log FOR SELECT USING (true);
CREATE POLICY "fan_points_log_insert" ON public.fan_points_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Fan Rules: 所有人可查看，admin/manager 可管理
ALTER TABLE public.fan_points_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fan_points_rules_select" ON public.fan_points_rules FOR SELECT USING (true);
CREATE POLICY "fan_points_rules_all" ON public.fan_points_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

ALTER TABLE public.fan_level_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fan_level_rules_select" ON public.fan_level_rules FOR SELECT USING (true);
CREATE POLICY "fan_level_rules_all" ON public.fan_level_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Materials: 所有人可查看
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_select" ON public.materials FOR SELECT USING (true);
CREATE POLICY "materials_all" ON public.materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Material Stocks: 所有人可查看
ALTER TABLE public.material_stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_stocks_select" ON public.material_stocks FOR SELECT USING (true);
CREATE POLICY "material_stocks_all" ON public.material_stocks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Material Inbound/Outbound: admin/manager 管理, rep 可创建出库申请
ALTER TABLE public.material_inbound ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_inbound_select" ON public.material_inbound FOR SELECT USING (true);
CREATE POLICY "material_inbound_insert" ON public.material_inbound FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

ALTER TABLE public.material_outbound ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_outbound_select" ON public.material_outbound FOR SELECT USING (true);
CREATE POLICY "material_outbound_insert" ON public.material_outbound FOR INSERT WITH CHECK (true);
CREATE POLICY "material_outbound_update" ON public.material_outbound FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- ============================================================
-- 24. 种子数据
-- ============================================================

-- 默认等级规则
INSERT INTO public.fan_level_rules (level, min_points, benefits) VALUES
  ('bronze', 0, '基础权益'),
  ('silver', 100, '享受95折优惠'),
  ('gold', 500, '享受9折优惠 + 优先配送'),
  ('platinum', 2000, '享受85折优惠 + 优先配送 + 新品试用'),
  ('diamond', 5000, '享受8折优惠 + 优先配送 + 新品试用 + 专属客服')
ON CONFLICT (level) DO NOTHING;

-- 默认积分规则
INSERT INTO public.fan_points_rules (action_type, points, description) VALUES
  ('完成拜访', 10, '每完成一次门店拜访'),
  ('上传照片', 5, '每次拜访上传产品照片'),
  ('提交动销数据', 5, '每次提交完整的动销数据'),
  ('新增门店', 20, '成功录入一个新门店'),
  ('推荐新粉丝', 30, '每推荐一位新粉丝注册')
ON CONFLICT DO NOTHING;

-- 默认产品
INSERT INTO public.products (name, sku, category, unit_price) VALUES
  ('示例产品A', 'SKU-A001', '饮料', 5.50),
  ('示例产品B', 'SKU-B001', '零食', 3.00),
  ('示例产品C', 'SKU-C001', '日用品', 12.00)
ON CONFLICT (sku) DO NOTHING;

-- 默认物料
INSERT INTO public.materials (name, sku, category, unit, unit_cost) VALUES
  ('宣传海报', 'MT-POSTER-01', '宣传物料', '张', 2.00),
  ('产品展架', 'MT-DISPLAY-01', '陈列物料', '个', 50.00),
  ('试用装小样', 'MT-SAMPLE-01', '试用物料', '份', 1.50),
  ('工服马甲', 'MT-UNIFORM-01', '服装物料', '件', 30.00)
ON CONFLICT (sku) DO NOTHING;
