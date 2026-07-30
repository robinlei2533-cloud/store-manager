# Admin Settings 总入口/容器真实 QA 问题矩阵

**Date**: 2026-07-25  
**Scope**: 仅 Admin Settings 总入口 `/app/settings` 及 4 个子页（Users / Products / Data / Audit）  
**Method**: Playwright 真实页面 QA，视图 `390x844` 与 `1151x698`，登录 `admin@uwell.com`  
**Baseline**: Task-130L 已合并，当前无代码改动

---

## 1. 执行摘要

本轮仅做 QA，未改代码、未改数据库/权限/依赖。

**核心发现**：SettingsPage 容器把 4 个子页当作 `Tabs.children` 渲染，并在外层套了一层 `Card.liquid-glass`；而每个子页自身又独立渲染 `PageTransition + div.bg-radial-top(minHeight:100vh, padding:24) + Card.liquid-glass.admin-readable-card`。结果是在 `/app/settings` 容器入口出现了 **卡片嵌套卡片**、**双重 100vh**、**双重 padding**、**双重 PageTransition**。

所有直接子路由（`/app/settings/users` 等）均正常；问题仅在容器入口 `/app/settings` 暴露。

| 指标 | 结果 |
|---|---|
| 390x844 横向溢出 | 无 |
| 1151x698 横向溢出 | 无 |
| 导航遮挡 | 无 |
| 控制台 warning / error | 无 |
| AntD 废弃 prop warning | 无 |

---

## 2. 问题矩阵

| # | 页面 | 问题 | 用户影响 | 严重级别 | 建议改法 | 影响文件 | 风险 | 是否本轮建议做 |
|---|---|---|---|---|---|---|---|---|
| 1 | `/app/settings` 容器入口（所有 tab） | **卡片嵌套 + 双重容器**：SettingsPage 外层 `Card.liquid-glass` 包裹 Tabs，每个子页内部又套 `Card.liquid-glass.admin-readable-card`；同时出现 2 个 `minHeight:100vh`、2 个 `padding:24`、2 个 `PageTransition`。实测：容器入口 `liquid-glass` 卡片数 3-5 张，嵌套关系在所有 tab 都存在。 | 视觉厚重、空白过多、内容下沉、与直接子路由视觉不一致，违反 `08_DESIGN_SYSTEM.md` R1「Cards cannot be nested」。 | **P0** | 让 SettingsPage 只负责 Tabs 导航和单层浅色/透明容器，子页在作为 tab children 渲染时去除自己的全屏 wrapper 和 Card；或让 `/app/settings` 重定向到 `/app/settings/users`，容器页本身不再渲染子页包装器。推荐前者以保留 tab 切换体验。 | `SettingsPage.jsx`、`UserManagementPage.jsx`、`ProductManagementPage.jsx`、`DataManagement.jsx`、`AuditLogPage.jsx`、`index.css` | 中：需要保证 4 个直接子路由仍可独立访问，且样式不崩。 | **是（本轮核心）** |
| 2 | `/app/settings/audit` 直接路由 | **子页包装不一致**：AuditLogPage 没有 `bg-radial-top` / `admin-settings-page` 全屏 wrapper，仅 `PageTransition > Card`，与其他 3 个子页结构不统一。 | 直接访问 Audit 时顶部/背景与 Users/Products/Data 不一致。 | **P1** | 在重构子页包装器时，统一 4 个子页的渲染模式（要么都有、要么都没有外层 wrapper）。 | `AuditLogPage.jsx` | 低 | **是（随 #1 一并处理）** |
| 3 | `/app/settings/data` 容器 + 直接路由 | **次级按钮对比度不足**：「导入数据恢复」「重置为演示数据」「清空所有数据」等按钮在浅色卡片上呈幽灵态，文字/边框很淡。 | 用户可能误以为这些操作不可用或看不到。 | **P1** | 提升次级按钮对比度：使用深色边框+文字，或改用 `type="default"` 但强制可见颜色。 | `DataManagement.jsx`、`index.css` | 低 | **是** |
| 4 | `/app/settings/audit` 容器 + 直接路由 | **导出 CSV 按钮对比度不足**：「导出CSV」按钮文字/图标过淡。 | 导出操作不突出。 | **P1** | 改为更明显的按钮样式（如 `type="primary"` 或带深色文字的默认按钮）。 | `AuditLogPage.jsx`、`index.css` | 低 | **否（可放下一轮）** |
| 5 | `/app/settings` 移动端 | **Tab 标签被截断**：390x844 下 tab 显示为「用户…」「产品…」「数据…」「审计…」。 | 用户无法一眼看全 tab 名称。 | **P2** | 缩小 tab padding/字号，或启用滚动 tab bar。 | `SettingsPage.jsx`、`index.css` | 低 | **否** |
| 6 | `/app/settings` 容器入口 | **Tabs 内卡片阴影/玻璃效果叠加**：外层 `liquid-glass` backdrop-filter + 内层 `liquid-glass` backdrop-filter 叠加，导致边缘发糊、视觉噪音。 | 降低后台专业感。 | **P1** | 同 #1：去掉一层 `liquid-glass`；外层容器改用 plain 浅色卡片或透明背景。 | `SettingsPage.jsx`、`index.css` | 低 | **是（同 #1）** |
| 7 | `/app/settings/users` 容器内 | **表格可用宽度被双层 padding 挤压**：实测容器内 Users 表 wrapper 宽度 198px（直接路由 274px），虽未溢出，但列更拥挤。 | 移动端表格更难读。 | **P2** | 同 #1 去掉一层 padding 后自然缓解；必要时为 Settings 内表格单独设置 `scroll.x`。 | `UserManagementPage.jsx` | 低 | **否（随 #1 缓解）** |

---

## 3. 浏览器 QA 原始数据

### 3.1 容器入口 `/app/settings`

| Tab | 总卡片数 | liquid-glass 卡片数 | 嵌套卡片数 | 390x844 溢出 | 1151x698 溢出 |
|---|---|---|---|---|---|
| users | 3 | 3 | 1 | 否 | 否 |
| products | 4 | 4 | 1 | 否 | 否 |
| data | 5 | 5 | 1 | 否 | 否 |
| audit | 10 | 5 | 1 | 否 | 否 |

### 3.2 直接子路由

| 路由 | 总卡片数 | liquid-glass 卡片数 | 嵌套卡片数 | 100vh div | 备注 |
|---|---|---|---|---|---|
| `/app/settings/users` | 2 | 2 | 0 | 1 | 正常 |
| `/app/settings/products` | 1 | 1 | 0 | 1 | 正常 |
| `/app/settings/data` | 1 | 1 | 0 | 1 | 正常 |
| `/app/settings/audit` | 0 | 0 | 0 | 0 | 缺少 wrapper，结构不一致 |

### 3.3 横向溢出 & 可点性

- 所有 10 个测试场景均 **无文档级横向溢出**。
- 所有按钮/下拉框/搜索框在两种视图下均可交互（Playwright 统计无 disabled 误报）。
- 侧边栏未遮挡内容：`navOverlap = false`（desktop）。
- 空状态：当前数据表均有数据，未触发空状态。

### 3.4 控制台

- 无 `pageerror`。
- 无 AntD 废弃 prop warning（Task-130L 已清理）。
- 无 React warning。

---

## 4. 本轮建议范围

**建议本轮只做 #1 + #2 + #3**，即：
1. 解决 SettingsPage 与子页之间的双重包装/卡片嵌套。
2. 统一 AuditLogPage 的 wrapper 结构。
3. 提升 DataManagement 次级按钮对比度。

**不做**：Fan / Store / preview、数据库/权限/依赖、其他页面的细节优化。

---

## 5. 回退方案

- 改动文件少（≤5 个 JSX + 少量 CSS）。
- 若 QA 不通过，可直接 `git checkout --` 还原这些文件；不触碰业务逻辑、localDb、seed、权限、env。

---

**Artifacts**:
- `frontend/output/playwright/task-130m-admin-settings-container-qa/`
- `frontend/output/playwright/task-130m-admin-settings-container-qa/qa-results.json`
- `frontend/output/playwright/task-130m-admin-settings-container-qa/qa-container-tabs.json`
