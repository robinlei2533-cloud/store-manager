# UWELL CRM

这是一个用于「粉丝运营 + CRM 管理」的网站项目，前端使用 React、Vite、Ant Design，数据层支持两种模式：

- 本地演示模式：没有配置 Supabase 时，数据保存在浏览器本地，适合演示和功能验证。
- 云端运营模式：配置 Supabase 后，多人可以在线登录、协作和管理真实数据。

## 当前模块

- 粉丝运营：粉丝列表、会员等级、扫码积分、增长看板、社区内容、积分规则。
- CRM 管理：门店管理、拜访记录、门店评估、活动管理、物料库存。
- 系统能力：角色权限、员工登录、Supabase 数据库、Vercel/Netlify 部署配置。

## 本地运行

进入前端目录后安装依赖并启动：

```bash
cd frontend
pnpm install
pnpm run dev
```

打开本地地址后：

- 粉丝端入口：`/`
- 管理端入口：`/admin`
- 未配置 Supabase 时，输入任意邮箱和密码即可进入本地演示模式。

## 正式上线建议

推荐上线架构：

- GitHub：保存项目代码。
- Supabase：保存用户、门店、拜访、粉丝、积分、活动和物料数据。
- Vercel：部署前端网站。
- 正式域名：绑定到 Vercel 项目。

上线前需要完成：

1. 在 Supabase 创建项目。
2. 执行 `database/migration.sql` 初始化数据库。
3. 创建 `visit-photos` Storage bucket，并确认上传/访问策略。
4. 在 Vercel 添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`，如果需要地图能力。
5. 部署后创建第一个管理员账号，并在 Supabase `profiles` 表里把角色调整为 `admin`。
6. 绑定正式域名并开启 HTTPS。

## 下一阶段重点

- 完成所有业务页面的中文化和品牌化。
- 为粉丝端补真实产品图片、会员权益和积分商城运营内容。
- 增加运营报表：新增粉丝、活跃粉丝、扫码转化、门店等级变化、活动投入产出。
- 完善权限规则和数据库安全策略，避免普通用户读取管理数据。
- 做移动端体验检查，重点优化粉丝端扫码、签到、兑换流程。
