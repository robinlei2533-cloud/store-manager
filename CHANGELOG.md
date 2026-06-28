# UWELL CRM · 更新日志

## v0.0.1 (2026-06-28)

### ✨ 初始版本 - 核心功能完成

#### 粉丝端 (Fan Center)
- 粉丝登录页 - 粒子特效 + 12款 Uwell 产品展示
- 每日签到 - 连续签到追踪，每次 +5 积分
- 扫码积分 - 每日限 3 次，每次 +5 积分
- 积分商城 - 积分兑换奖品
- 邀请系统 - 邀请码生成与追踪
- 社区 - 发帖与点赞
- 帮助中心 - FAQ

#### 门店端 (Store Owner)
- 门店信息管理
- 粉丝列表
- 扫码记录

#### 管理后台 (Admin)
- 管理员/经理/专员 三级角色权限
- 仪表盘
- 门店管理
- 拜访记录
- 门店评估
- 活动管理
- 物料库存
- 粉丝运营管理
- 系统设置

#### 技术架构
- 前端: React 19 + Vite 8 + Ant Design 6 + React Query 5
- 状态管理: Zustand 5
- 数据层: localStorage 本地模式 (26 张表)
- 云模式: Supabase 集成就绪 (待配置上线)
- 构建: Vite build 成功 (3721 模块, ~2.3MB)

## v0.1.0 (2026-06-28)

### Phase 1 — 后端基建
- 审计日志系统 (audit_logs 表 + 16 个触发器)
- 数据库备份脚本 (full/schema/data 三种模式)
- Supabase 部署指南
- PWA manifest + Service Worker
- 共享 Design System CSS (liquid-glass 提取)
- 管理端 i18n (17处硬编码替换)

### Phase 2 — 前端重构
- PWA 全面支持 (3个入口 + manifest + SW注册)
- 管理端侧边栏国际化 (中/英/阿)
- 3个HTML入口去重CSS (design-system.css)

### Phase 3 — 功能完善
- Supabase Realtime 实时订阅 (Dashboard + FanCenter)
- 运营日报视图 (v_daily_ops_report + v_weekly_trend)
- 移动端响应式修复
- 仪表盘增强建议

### Phase 4 — 运维监控
- Sentry 错误监控配置
- 审计日志查看页面
- 部署文档
