# UWELL CRM — 核心功能规格文档 (Spec)

## 一、系统架构概览

| 维度 | 技术选型 |
|------|----------|
| 前端 | React 19 + Vite 8 + Ant Design 6 |
| 状态管理 | Zustand 5 + React Query 5 |
| 路由 | HashRouter（三入口隔离） |
| 数据层 | Supabase（线上）/ localStorage（离线开发） |
| 认证 | Supabase Auth + 本地降级模式 |
| 类型 | 全 JSX（无 TypeScript） |

## 二、用户角色与权限

| 角色 | 缩写 | 权限范围 |
|------|------|---------|
| Admin | admin | 全部权限：门店/拜访/评估/活动/物料/粉丝/用户管理/设置 |
| Manager | manager | 除设置外同 admin |
| Rep | rep | 拜访、评估、物料（只读+创建） |
| Store Owner | store_owner | 查看自己门店数据、粉丝、物料 |
| Fan | fan | 签到、扫码、积分、邀请、社区 |

## 三、核心模块与成功标准

### 模块 1：门店管理 (Stores)

**成功标准：**
- Admin/Manager 可创建、编辑、查看、删除门店
- 门店字段完整：名称、地址、坐标(lat/lng)、等级(S/A/B/C)、连锁信息、联系方式
- 门店列表支持分页、搜索
- 门店详情展示完整信息 + 关联拜访记录

**核心字段：** id, name, address, lat, lng, level, chain_name, contact, phone

### 模块 2：拜访记录 (Visits)

**成功标准：**
- Rep 可为已分配的门店创建拜访记录
- 拜访记录包含：门店、日期、状态(draft/completed/cancelled)、备注
- 拜访列表支持按门店、日期、状态筛选
- 拜访详情展示完整记录

**核心字段：** id, store_id, rep_id, visit_date, status, notes

### 模块 3：店铺评估 (Evaluation)

**成功标准：**
- Rep 可在拜访时或单独提交店铺评估
- 评估维度：整洁度、服务质量、产品陈列、产品知识
- 评估结果生成整体评分
- 评估历史可追溯

### 模块 4：活动管理 (Campaigns)

**成功标准：**
- Admin/Manager 可创建品牌活动（任务型）
- 活动有起止时间、类型、描述、奖励积分
- Store Owner 可看到活动并领取
- Rep 可看到领取记录并配送物料

### 模块 5：物料管理 (Materials)

**成功标准：**
- Admin 可管理物料库存（入库/出库/盘点）
- 物料分类：展示架、海报、试用装等
- Store Owner 可根据等级领取对应物料礼包
- Rep 可记录物料配送

### 模块 6：粉丝运营 (Fans)

**成功标准：**
- 用户可注册为粉丝
- 每日签到 +5 积分，连续签到奖励
- 扫码认证产品 +5 积分（每日限 3 次）
- 积分商城可兑换产品
- 邀请好友获得额外积分

### 模块 7：数据看板 (Dashboard)

**成功标准：**
- 首屏展示核心 KPI：门店总数、本月拜访数、粉丝总数、物料库存
- 拜访趋势图（按周/月）
- 优质门店排行
- 最近拜访列表

## 四、核心链路流程

### 链路 1：门店管理闭环
`
Admin登录 → [门店管理] → 创建门店 → 分配Rep → 
Rep登录 → [拜访管理] → 创建拜访 → 
[评估管理] → 提交评估 → 完成闭环
`

### 链路 2：活动管理闭环
`
Admin → [活动管理] → 创建活动 → 发布 →
Store Owner → [活动专区] → 领取活动 →
Rep → [物料配送] → 配送物料到店 →
Store Owner → [活动复盘] → 提交复盘数据
`

### 链路 3：粉丝增长闭环
`
用户 → [粉丝登录页] → 注册/登录 →
[每日签到] → +5积分 →
[扫码认证] → +5积分/日限3次 →
[积分商城] → 兑换产品 →
[邀请好友] → 获得额外积分
`

## 五、路由结构

| 路由 | 页面 | 角色限制 |
|------|------|---------|
| /fan-entry | 粉丝登录页 | 公开 |
| /fan-center | 粉丝中心 | 公开 |
| /store-owner | 店主门户 | 公开(本地) |
| /admin | 管理登录 | 公开 |
| /login | 管理登录 | 公开 |
| /app/dashboard | 数据看板 | admin/manager/rep |
| /app/stores/* | 门店管理 | admin/manager |
| /app/visits/* | 拜访管理 | admin/manager/rep |
| /app/evaluation/* | 评估管理 | admin/manager/rep |
| /app/campaigns/* | 活动管理 | admin/manager |
| /app/fans/* | 粉丝运营 | admin/manager |
| /app/materials/* | 物料管理 | admin/manager/rep |
| /app/settings/* | 系统设置 | admin |

## 六、已知问题清单

见 [.agents/issues.md](./issues.md)
