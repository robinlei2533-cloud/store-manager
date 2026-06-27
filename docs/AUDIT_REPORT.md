# UWELL CRM — 完整审计报告与优化方案

> **日期**: 2026-06-27
> **构建状态**: ✅ 成功 (3742 modules, 2.48MB)
> **Git 标签**: v0.1.0 → v0.2.0 → v0.2.1 → **v0.3.0**
> **服务器**: http://localhost:3456/

---

## 一、项目回顾 — 我们正在构建什么？

**UWELL 中东非市场增长操作系统** — 粉丝运营 + 门店拜访 + 库存管理的 CRM 平台。

### 核心用户角色

| 角色 | 权限 | 入口 |
|------|------|------|
| 粉丝 | 签到/积分/兑换/社区/邀请 | /#/fan-entry → /#/fan-center |
| 店主 | 门店信息/粉丝列表/扫码 | /#/store-owner |
| 地推(rep) | 拜访记录/店铺评估/物料 | /#/admin → /#/app/* |
| 管理员 | 全部数据 + 设置 | /#/admin → /#/app/* |

### 业务闭环
粉丝增长 → 门店拜访 → 活动推广 → 物料管理 → 积分兑换 → 粉丝留存

---

## 二、页面逐项审计

### 2.1 粉丝登录页 (/#/fan-entry)
- **文件**: FanEntryPage.jsx (524行)
- **功能**: ✅ 粒子背景 ✅ 12个产品展示 ✅ 进入按钮
- **问题**: 硬编码中文; 右上角缺管理员入口; LanguageSwitcher 重复

### 2.2 粉丝中心 (/#/fan-center)
- **文件**: FanCenterPage.jsx (162行) + 6个Tab
- **功能**: ✅ CheckIn ✅ Scan ✅ Mall ✅ Invite ✅ Community ✅ Help
- **问题**: ⚠️ localDb.needsInit() 在render中; Tab标签硬编码英文; 数据未联通

### 2.3 店主页面 (/#/store-owner)
- **文件**: StoreOwnerPage.jsx — 3个Tab

### 2.4 管理后台 (/#/app/*)
- **文件**: AppLayout.jsx (219行) — 角色权限侧边栏
- **问题**: 菜单硬编码中文; rep角色无分组结构

---

## 三、架构深度分析

### 数据层
- 双模式: localStorage (本地) + Supabase (线上)
- seedData.js 442行, 26张表
- ⚠️ localStorage 79.5KB, 运营增长将达上限

### 多语言系统
- 200+ 翻译键 zh/en/ar
- t() 已注入43个JSX文件但硬编码文本尚未替换

### 参考站点
- **React Bits** (⭐ 用户最喜欢): 深色主题, TextShimmer/Particles/AuroraBackground
- **Unicorn Studio**: 3D WebGL交互
- **Motion Sites**: 大片级Hero动画

---

## 四、执行计划

### P0 — 立即修复 (30min)
1. FanCenterPage DB init 移到 effect
2. Tab标签使用翻译键
3. 粉丝页右上角加管理员入口
4. 修复 inlineDynamicImports 弃用警告

### P1 — 核心体验 (2h)
5. 全局硬编码文本替换为翻译键
6. 粉丝中心Tab数据联通 (签到→商城兑换)
7. React Bits 动画集成 (TextShimmer/Particles)

### P2 — 架构优化 (4h)
8. 代码分割 manualChunks
9. 品牌色 Token 化
10. 统一视觉系统

### P3 — 长期规划
11. GitHub 推送 + Supabase 部署
