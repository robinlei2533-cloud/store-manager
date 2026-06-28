# UWELL CRM — Supabase 部署指南

## 执行步骤

1. 打开 Supabase Dashboard
   https://supabase.com/dashboard/project/rdsrgpnvzcchqlsghsrq

2. 进入 SQL Editor

3. **先运行基础Schema** (创建22个业务表 + RLS + 种子数据)
   - 打开 `database/one_shot_setup.sql`
   - 全部复制粘贴到 SQL Editor
   - 点击 Run

4. **再运行审计日志系统** (audit_logs 表 + 触发器)
   - 打开 `database/audit_logs.sql`
   - 全部复制粘贴到新标签页
   - 点击 Run

5. **验证安装**
```sql
-- 检查表数量
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- 检查种子数据
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.stores;
SELECT COUNT(*) FROM public.fans;
SELECT COUNT(*) FROM public.products;

-- 检查审计触发器
SELECT trigger_name, event_manipulation FROM information_schema.triggers
WHERE event_object_schema = 'public' LIMIT 20;

-- 检查 RLS
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
```

6. **设置 Storage bucket**
   - 进入 Storage → New Bucket
   - 名称: `visit-photos`
   - 公开: 否
   - 创建后设置策略允许 authenticated 用户上传

7. **创建管理员账号**
   - Authentication → Users → Invite user
   - 输入邮箱，用户会在 profiles 表自动创建
   - 在 SQL Editor 中运行:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## 备用方案

如果 Supabase Dashboard 不可用，可使用 CLI:
```bash
npx supabase login
npx supabase db push --db-url "postgresql://..." 
```
