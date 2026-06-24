-- Drop all foreign key constraints first, then alter types, then recreate constraints

-- ============ Step 1: Drop FK constraints ============

ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_store_id_fkey;
ALTER TABLE public.visits DROP CONSTRAINT IF EXISTS visits_rep_id_fkey;
ALTER TABLE public.visit_sales DROP CONSTRAINT IF EXISTS visit_sales_visit_id_fkey;
ALTER TABLE public.visit_sales DROP CONSTRAINT IF EXISTS visit_sales_product_id_fkey;
ALTER TABLE public.visit_photos DROP CONSTRAINT IF EXISTS visit_photos_visit_id_fkey;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_created_by_fkey;
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_chain_id_fkey;
ALTER TABLE public.material_stocks DROP CONSTRAINT IF EXISTS material_stocks_material_id_fkey;
ALTER TABLE public.material_inbound DROP CONSTRAINT IF EXISTS material_inbound_material_id_fkey;
ALTER TABLE public.material_inbound DROP CONSTRAINT IF EXISTS material_inbound_operator_id_fkey;
ALTER TABLE public.material_outbound DROP CONSTRAINT IF EXISTS material_outbound_material_id_fkey;
ALTER TABLE public.material_outbound DROP CONSTRAINT IF EXISTS material_outbound_applicant_id_fkey;
ALTER TABLE public.material_outbound DROP CONSTRAINT IF EXISTS material_outbound_store_id_fkey;
ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_sku_key;
ALTER TABLE public.fans DROP CONSTRAINT IF EXISTS fans_store_id_fkey;
ALTER TABLE public.fans DROP CONSTRAINT IF EXISTS fans_user_id_fkey;
ALTER TABLE public.fan_points_log DROP CONSTRAINT IF EXISTS fan_points_log_fan_id_fkey;
ALTER TABLE public.store_evaluations DROP CONSTRAINT IF EXISTS store_evaluations_store_id_fkey;
ALTER TABLE public.store_evaluations DROP CONSTRAINT IF EXISTS store_evaluations_evaluator_id_fkey;
ALTER TABLE public.campaign_tasks DROP CONSTRAINT IF EXISTS campaign_tasks_campaign_id_fkey;
ALTER TABLE public.campaign_tasks DROP CONSTRAINT IF EXISTS campaign_tasks_assignee_id_fkey;
ALTER TABLE public.campaign_reports DROP CONSTRAINT IF EXISTS campaign_reports_campaign_id_fkey;
ALTER TABLE public.qr_codes DROP CONSTRAINT IF EXISTS qr_codes_product_id_fkey;
ALTER TABLE public.qr_codes DROP CONSTRAINT IF EXISTS qr_codes_store_id_fkey;
ALTER TABLE public.scan_records DROP CONSTRAINT IF EXISTS scan_records_qr_code_id_fkey;
ALTER TABLE public.scan_records DROP CONSTRAINT IF EXISTS scan_records_fan_id_fkey;
ALTER TABLE public.scan_records DROP CONSTRAINT IF EXISTS scan_records_product_id_fkey;
ALTER TABLE public.scan_records DROP CONSTRAINT IF EXISTS scan_records_store_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============ Step 2: Alter all ID columns to TEXT ============

ALTER TABLE public.products ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.materials ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.material_stocks ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.material_stocks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.stores ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.stores ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.visits ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.visits ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.visit_sales ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.visit_sales ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.visit_photos ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.visit_photos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fans ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.fans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fan_points_log ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.fan_points_log ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fan_points_rules ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.fan_points_rules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fan_level_rules ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.fan_level_rules ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.material_inbound ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.material_inbound ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.material_outbound ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.material_outbound ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.store_evaluations ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.store_evaluations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.campaigns ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.campaigns ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.campaign_tasks ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.campaign_tasks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.campaign_reports ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.campaign_reports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.qr_codes ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.qr_codes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.scan_records ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.scan_records ALTER COLUMN id DROP DEFAULT;

-- ============ Step 3: Alter FK columns to TEXT ============

ALTER TABLE public.visits ALTER COLUMN store_id TYPE TEXT USING store_id::text;
ALTER TABLE public.visits ALTER COLUMN rep_id TYPE TEXT USING rep_id::text;
ALTER TABLE public.visit_sales ALTER COLUMN visit_id TYPE TEXT USING visit_id::text;
ALTER TABLE public.visit_sales ALTER COLUMN product_id TYPE TEXT USING product_id::text;
ALTER TABLE public.visit_photos ALTER COLUMN visit_id TYPE TEXT USING visit_id::text;
ALTER TABLE public.stores ALTER COLUMN created_by TYPE TEXT USING created_by::text;
ALTER TABLE public.stores ALTER COLUMN chain_id TYPE TEXT USING chain_id::text;
ALTER TABLE public.material_stocks ALTER COLUMN material_id TYPE TEXT USING material_id::text;
ALTER TABLE public.material_inbound ALTER COLUMN material_id TYPE TEXT USING material_id::text;
ALTER TABLE public.material_inbound ALTER COLUMN operator_id TYPE TEXT USING operator_id::text;
ALTER TABLE public.material_outbound ALTER COLUMN material_id TYPE TEXT USING material_id::text;
ALTER TABLE public.material_outbound ALTER COLUMN applicant_id TYPE TEXT USING applicant_id::text;
ALTER TABLE public.material_outbound ALTER COLUMN store_id TYPE TEXT USING store_id::text;
ALTER TABLE public.fans ALTER COLUMN store_id TYPE TEXT USING store_id::text;
ALTER TABLE public.fans ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.fan_points_log ALTER COLUMN fan_id TYPE TEXT USING fan_id::text;
ALTER TABLE public.store_evaluations ALTER COLUMN store_id TYPE TEXT USING store_id::text;
ALTER TABLE public.store_evaluations ALTER COLUMN evaluator_id TYPE TEXT USING evaluator_id::text;
ALTER TABLE public.campaign_tasks ALTER COLUMN campaign_id TYPE TEXT USING campaign_id::text;
ALTER TABLE public.campaign_tasks ALTER COLUMN assignee_id TYPE TEXT USING assignee_id::text;
ALTER TABLE public.campaign_reports ALTER COLUMN campaign_id TYPE TEXT USING campaign_id::text;
ALTER TABLE public.qr_codes ALTER COLUMN product_id TYPE TEXT USING product_id::text;
ALTER TABLE public.qr_codes ALTER COLUMN store_id TYPE TEXT USING store_id::text;
ALTER TABLE public.scan_records ALTER COLUMN qr_code_id TYPE TEXT USING qr_code_id::text;
ALTER TABLE public.scan_records ALTER COLUMN fan_id TYPE TEXT USING fan_id::text;
ALTER TABLE public.scan_records ALTER COLUMN product_id TYPE TEXT USING product_id::text;
ALTER TABLE public.scan_records ALTER COLUMN store_id TYPE TEXT USING store_id::text;
