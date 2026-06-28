# UWELL CRM — 部署文档

> 汇总从初始化到上线的完整部署流程。

---

## 目录

1. [Supabase 初始化](#1-supabase-初始化)
2. [环境变量配置](#2-环境变量配置)
3. [本地构建](#3-本地构建)
4. [Vercel 部署](#4-vercel-部署)
5. [域名绑定](#5-域名绑定)
6. [上线前检查清单](#6-上线前检查清单)
7. [备份策略](#7-备份策略)

---

## 1. Supabase 初始化

详细步骤请参考 [`database/RUN_ON_SUPABASE.md`](database/RUN_ON_SUPABASE.md)。

快速概览：

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard/project/rdsrgpnvzcchqlsghsrq)
2. 进入 SQL Editor，**先运行** `database/one_shot_setup.sql`（创建22张业务表 + RLS + 种子数据）
3. **再运行** `database/audit_logs.sql`（创建 audit_logs 表 + 16个触发器）
4. **最后运行** `database/ops_daily_report.sql`（创建日报视图 v_daily_ops_report / v_weekly_trend）
5. 创建 `visit-photos` Storage bucket，设置公开读取策略
6. 在 Authentication > Settings 中确认已关闭「Confirm email」（演示环境）

验证 SQL：

```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
SELECT trigger_name, event_manipulation FROM information_schema.triggers WHERE event_object_schema = 'public';
```

---

## 2. 环境变量配置

### 本地开发

复制 `.env.example` 为 `.env`（如未自动生成则手动创建）：

```bash
VITE_SUPABASE_URL=https://rdsrgpnvzcchqlsghsrq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx   # 可选
```

> 不配置 `VITE_SUPABASE_URL` 时自动启用 localStorage 本地模式。

### Vercel 生产环境

在 Vercel 项目 Settings > Environment Variables 中添加：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| VITE_SUPABASE_URL | Supabase 项目 URL | 是 |
| VITE_SUPABASE_ANON_KEY | Supabase 匿名 Key | 是 |
| VITE_SENTRY_DSN | Sentry DSN（错误监控） | 否 |

---

## 3. 本地构建

```bash
cd frontend && npm install
npm run dev
npm run build
npm run preview
```

构建产物位于 `frontend/dist/`。

---

## 4. Vercel 部署

### 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 Vercel，点击 Add New Project
3. 导入 GitHub 仓库
4. Framework Preset 选择 Vite
5. 构建配置自动从 vercel.json 读取
6. 添加以上环境变量
7. 点击 Deploy

### 手动部署（CLI）

```bash
npx vercel --prod
```

### Vercel 配置参考 (vercel.json)

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 5. 域名绑定

1. 在 Vercel 项目 Settings > Domains 输入域名
2. 按提示在 DNS 服务商添加 CNAME 记录指向 cname.vercel-dns.com
3. Vercel 自动申请并续期 HTTPS 证书（Let's Encrypt）
4. 等待 DNS 生效（通常 5-30 分钟）

---

## 6. 上线前检查清单

### 功能验证

- [ ] 管理端仪表盘正常显示核心指标
- [ ] 门店管理 CRUD 正常
- [ ] 拜访记录创建/编辑/删除正常
- [ ] 门店评估流程完整
- [ ] 活动管理创建/分配任务正常
- [ ] 物料入库/出库/库存查询正常
- [ ] 粉丝列表、签到、扫码积分正常
- [ ] 积分商城兑换流程完整
- [ ] 社区发帖/点赞正常

### 数据与权限

- [ ] Supabase 表结构和 RLS 已部署
- [ ] 审计日志触发器正常运行
- [ ] 管理员/经理/专员/粉丝角色权限边界正确
- [ ] 数据已清理演示数据，导入真实门店和产品
- [ ] Storage bucket 已创建，权限正确

### 部署与环境

- [ ] 代码已推送到 GitHub
- [ ] Vercel 已连接 GitHub 仓库
- [ ] 环境变量已配置
- [ ] 生产构建无报错
- [ ] 自定义域名已绑定，HTTPS 证书已生效
- [ ] Sentry 错误监控已配置（若需）

### 运营准备

- [ ] 已创建首批员工账号
- [ ] 已配置粉丝等级规则和积分规则
- [ ] 已配置扫码积分码和对应产品
- [ ] 已配置积分商城奖品、库存和兑换规则
- [ ] 已准备客服联系方式、活动规则、隐私说明和用户协议

---


## 7. 备份策略

### 数据库备份

项目备份文件位于 `backup_*` 目录中（如 `backup_20260627_163514`），包含完整的前端源码快照。

建议备份频率：

| 环境 | 频率 | 说明 |
|------|------|------|
| 生产 | 每日 | 自动全量备份，保留最近7天 |
| 预发布 | 每周 | 每次发布前手动备份 |
| 本地 | 按需 | 通过 Data Management 页面导出 JSON |

### 数据恢复

- **本地模式**: 通过管理后台 Settings > Data 页面导入之前导出的 JSON 备份文件
- **Supabase 模式**: 通过 Supabase Dashboard 的 Database > Backup 功能进行恢复
