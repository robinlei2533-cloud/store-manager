-- UWELL CRM — 运营日报视图
CREATE OR REPLACE VIEW public.v_daily_ops_report AS
SELECT
  CURRENT_DATE as report_date,
  (SELECT COUNT(*) FROM public.fans WHERE created_at::date = CURRENT_DATE) as new_fans_today,
  (SELECT COUNT(*) FROM public.visits WHERE visit_date = CURRENT_DATE) as visits_today,
  (SELECT COUNT(*) FROM public.scan_records WHERE created_at::date = CURRENT_DATE) as scans_today,
  (SELECT COUNT(*) FROM public.fans) as total_fans,
  (SELECT COUNT(*) FROM public.stores) as total_stores,
  (SELECT COUNT(*) FROM public.material_stocks WHERE qty <= safety_stock) as low_stock_items,
  (SELECT COUNT(*) FROM public.campaigns WHERE status = 'ongoing') as active_campaigns;

-- 近7天趋势
CREATE OR REPLACE VIEW public.v_weekly_trend AS
SELECT
  d::date as date,
  (SELECT COUNT(*) FROM public.fans WHERE created_at::date = d) as new_fans,
  (SELECT COUNT(*) FROM public.visits WHERE visit_date = d) as visits,
  (SELECT COUNT(*) FROM public.scan_records WHERE created_at::date = d) as scans
FROM generate_series(CURRENT_DATE - 7, CURRENT_DATE, '1 day'::interval) d;
