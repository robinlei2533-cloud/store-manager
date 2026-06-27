# UWELL CRM — 三端分离架构设计

> **日期**: 2026-06-27
> **状态**: 设计稿 v1 — 待用户审核
> **Git**: 当前 v0.4.0

---

## 一、当前问题

1. **单 SPA 脆弱**: 粉丝/店主/管理员全部在同一个 React 应用里，任一页面的 JS 错误会崩掉整个站点
2. **首屏过大**: 3742 个模块全部打包到 2.4MB 的单个 JS 文件中
3. **数据层混乱**: 粉丝数据和管理数据共享同一个 localStorage 命名空间
4. **无权限隔离**: 地推角色和管理员角色共用同一个路由表

---

## 二、目标架构

三个独立 HTML 入口，共享组件库 + 共享 API 层：

```
uwell-crm/frontend/
├── public/
│   ├── fan-app.html          ← 粉丝端入口（独立构建）
│   ├── store-app.html        ← 店主端入口（独立构建）
│   └── index.html            ← 管理后台入口（原有）
├── src/
│   ├── fan/                  ← 粉丝端页面
│   │   ├── pages/
│   │   │   ├── FanEntryPage.jsx
│   │   │   └── FanCenterPage.jsx (6个Tab)
│   │   └── main.jsx          ← 粉丝端 React 入口
│   ├── store/                ← 店主端页面
│   │   ├── pages/
│   │   │   └── StoreOwnerPage.jsx (3个Tab)
│   │   └── main.jsx          ← 店主端 React 入口
│   ├── admin/                ← 管理后台（原有）
│   │   ├── pages/...
│   │   └── main.jsx
│   ├── components/shared/    ← 共享组件
│   ├── services/             ← 共享 API 层 (localDb + Supabase)
│   ├── stores/               ← 共享 Zustand stores
│   └── utils/                ← 共享工具函数 + 翻译
├── vite.config.js            ← 三个入口的多页面构建
```

### 三端入口关系

```
fan.domain.com ──→ fan-app.html ──→ FanApp (React)
                                        ├── FanEntryPage (粒子特效 + 产品)
                                        └── FanCenterPage (签到/商城/社区/邀请/帮助)

store.domain.com ──→ store-app.html ──→ StoreApp (React)
                                           └── StoreOwnerPage (门店信息/粉丝/扫码)

admin.domain.com ──→ index.html ──→ AdminApp (React)
                                       ├── LoginPage
                                       └── AppLayout
                                            ├── Dashboard
                                            ├── 拜访记录
                                            ├── 店铺评估
                                            ├── 物料管理
                                            └── 活动管理
```

---

## 三、数据流

```
FanApp ──→ localDb ──→ localStorage (种子数据)
  │           │
  │           └──→ Supabase (生产环境)
  │
StoreApp ──→ localDb ──→ localStorage
  │           │
  │           └──→ Supabase
  │
AdminApp ──→ localDb ──→ localStorage
              │
              └──→ Supabase
```

所有三端通过同一个 `services/db/localDb.js` 引擎操作数据，API 层统一，切换 Supabase 时三端同时切换。

---

## 四、Phase 1 执行计划

**目标**: 把粉丝端从主 SPA 中分离出来

### 步骤

1. **创建 `fan/main.jsx`** — 粉丝端独立的 React 入口
   - 只导入 FanEntryPage + FanCenterPage
   - 不导入 Admin、StoreOwner、Material 等无关页面
   
2. **配置 Vite 多页面构建**
   ```js
   // vite.config.js
   build: {
     rollupOptions: {
       input: {
         admin: 'index.html',
         fan: 'fan-app.html',
         store: 'store-app.html',
       }
     }
   }
   ```

3. **迁移 Fans 页面**
   - 将 FanEntryPage、FanCenterPage 及其 6 个 Tab 复制到 `src/fan/pages/`
   - 保留共享依赖 (`localDb`, `stores`, `utils`) 在原位

4. **构建验证**
   - `fan-app.html` 加载单独 JS bundle (~500KB vs 2.4MB)
   - `index.html` 不再包含粉丝代码

5. **Git 打标签** `v0.5.0`

---

## 五、Phase 2 执行计划

**目标**: 完善店主端 + 管理后台功能

### 步骤

1. 创建 `store/main.jsx` — 店主端独立入口
2. 门店信息Tab → 显示粉丝签到数据
3. 粉丝列表Tab → 显示门店关联粉丝
4. 扫码记录Tab → 显示粉丝扫码记录
5. 管理员后台角色权限精确控制（admin/manager/rep）

---

## 六、Phase 3 执行计划

**目标**: 数据持久化 + 上线

1. GitHub 推送（已有仓库 + token）
2. Supabase 数据库建表（SQL 已准备）
3. 本地数据迁移脚本
4. 部署到生产环境

---

## 七、不做的功能（YAGNI）

- ❌ TypeScript 迁移（现在不是好时机）
- ❌ 微前端框架（qiankun/single-spa）
- ❌ SSR/SSG
- ❌ i18n 全面国际化（保持 zh/en/ar 现有翻译）
- ❌ E2E 测试框架
