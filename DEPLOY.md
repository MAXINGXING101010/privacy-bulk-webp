# PrivacyBulkWebP — 部署教程

## 目录
1. [项目结构](#项目结构)
2. [环境准备](#环境准备)
3. [数据库配置 (Vercel Postgres)](#数据库配置)
4. [PayPal 订阅配置](#paypal-订阅配置)
5. [Google AdSense 配置](#google-adsense-配置)
6. [Vercel 环境变量配置](#vercel-环境变量配置)
7. [部署步骤](#部署步骤)
8. [测试流程](#测试流程)

---

## 项目结构

```
privacybulkwebp/
├── api/                          # Vercel Serverless Functions
│   ├── auth/
│   │   ├── register.js          # 用户注册
│   │   ├── login.js             # 用户登录
│   │   ├── me.js                # 获取当前用户信息
│   │   └── logout.js            # 退出登录
│   ├── subscription/
│   │   ├── create.js            # 创建 PayPal 订阅
│   │   ├── status.js            # 查询订阅状态
│   │   └── webhook.js           # PayPal Webhook 回调
│   └── conversions/
│       ├── log.js               # 记录转换历史
│       └── history.js           # 获取转换历史
├── src/
│   ├── components/
│   │   ├── ads/                 # 广告组件
│   │   │   ├── AdBanner.jsx     # 通用广告横幅
│   │   │   ├── SidebarAd.jsx    # 侧边栏广告
│   │   │   ├── BottomAd.jsx     # 底部广告
│   │   │   └── ContentAd.jsx    # 内容区广告
│   │   ├── AuthModal.jsx        # 登录/注册弹窗
│   │   ├── UpgradeModal.jsx     # 升级提示弹窗
│   │   ├── Header.jsx           # 导航栏
│   │   ├── Footer.jsx           # 页脚
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.js           # 认证 Hook
│   │   ├── useTier.js           # 会员等级 Hook
│   │   └── useConverter.js      # 转换功能 Hook
│   ├── pages/
│   │   ├── PricingPage.jsx      # 定价页面
│   │   ├── DashboardPage.jsx    # 会员中心
│   │   ├── AboutPage.jsx        # 关于我们
│   │   ├── LegalPage.jsx        # 法律页面模板
│   │   └── legalContent.js      # 法律文档内容
│   └── utils/
│       ├── auth.js              # JWT 工具函数
│       ├── paypal.js            # PayPal API 工具
│       └── db.js                # 数据库工具
├── schema.sql                   # 数据库建表 SQL
├── .env.example                 # 环境变量模板
└── DEPLOY.md                    # 本文档
```

---

## 环境准备

### 前置条件
- Node.js 20.x
- Vercel 账号
- PayPal Business 账号
- Google AdSense 账号（已审核通过）

### 本地开发
```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

---

## 数据库配置

### 1. 在 Vercel 创建 Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 → **Storage** 标签
3. 点击 **Create Database** → 选择 **Postgres**
4. 数据库会自动关联到你的项目

### 2. 初始化数据库表

连接数据库后执行 `schema.sql` 中的 SQL：

```bash
# 方式一：通过 Vercel Dashboard 的 SQL Editor 执行
# 进入 Storage → Postgres → 打开 SQL Editor → 粘贴 schema.sql 内容

# 方式二：通过 psql 命令行（需要先获取连接字符串）
psql $POSTGRES_URL -f schema.sql
```

这将创建以下表：
- `users` — 用户信息（email, password_hash）
- `subscriptions` — 订阅状态（tier, status, PayPal ID, 到期时间）
- `conversion_history` — 转换历史记录

---

## PayPal 订阅配置

### 1. 创建 PayPal App

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 选择 **Sandbox**（测试）或 **Live**（生产）
3. 点击 **Create App**
4. 填写 App 名称（如 "PrivacyBulkWebP"）
5. 记录 **Client ID** 和 **Secret**

### 2. 创建订阅计划 (Plan)

1. 在 PayPal Dashboard 进入 **Subscriptions** → **Plans**
2. 点击 **Create Plan**
3. 创建两个计划：

**Personal Plan ($5.99/月):**
- 名称: PrivacyBulkWebP Personal
- 周期: Monthly
- 价格: $5.99
- 记录 Plan ID

**Pro Plan ($9.99/月):**
- 名称: PrivacyBulkWebP Pro
- 周期: Monthly
- 价格: $9.99
- 记录 Plan ID

### 3. 配置 Webhook

1. 在 PayPal Dashboard 进入 **Webhooks**
2. 点击 **Add webhook**
3. 填写：
   - **Webhook URL**: `https://yourdomain.com/api/subscription/webhook`
   - **Event types** 选择：
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.EXPIRED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `BILLING.SUBSCRIPTION.UPGRADED`
4. 保存

---

## Google AdSense 配置

### 1. 申请 AdSense

1. 登录 [Google AdSense](https://www.google.com/adsense/)
2. 添加你的网站域名
3. 添加验证代码到 `index.html` 的 `<head>` 中（已预置）
4. 等待审核通过

### 2. 创建广告单元

审核通过后，在 AdSense 中创建以下广告单元：
- **sidebar-ad** — 侧边栏垂直广告
- **results-ad** — 转换结果下方横向广告
- **content-ad** — 内容区自动广告

### 3. 配置广告显示逻辑

广告仅对免费用户显示。代码逻辑已在 `useAuth.js` 中实现：
```js
const showAds = tier === 'free'; // 付费用户自动隐藏广告
```

广告组件通过 `showAds` prop 控制渲染：
- `showAds=true` → 显示广告容器
- `showAds=false` → 返回 `null`，不渲染任何广告 DOM 元素

### 4. 设置 Publisher ID

在 `index.html` 中替换 `ca-pub-XXXXXXXXXXXXXXXX` 为你的实际 AdSense Publisher ID：
```html
<script>
  window.ADSENSE_PUBLISHER_ID = 'ca-pub-YOUR-ACTUAL-ID';
</script>
```

或通过环境变量（推荐生产环境）：
```
VITE_ADSENSE_PUBLISHER_ID=ca-pub-YOUR-ACTUAL-ID
```

---

## Vercel 环境变量配置

在 Vercel Dashboard → **Settings** → **Environment Variables** 中配置：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `POSTGRES_URL` | Postgres 连接字符串 | `postgresql://user:pass@host/db` (自动配置) |
| `JWT_SECRET` | JWT 签名密钥 (至少32字符) | `openssl rand -base64 48` 生成 |
| `PAYPAL_CLIENT_ID` | PayPal App Client ID | `AXxxx...` |
| `PAYPAL_SECRET` | PayPal App Secret | `EGxxx...` |
| `PAYPAL_BASE_URL` | PayPal API 地址 | Sandbox: `https://api-m.sandbox.paypal.com` / Production: `https://api-m.paypal.com` |
| `PAYPAL_PLAN_PERSONAL` | Personal 方案 Plan ID | `P-xxx...` |
| `PAYPAL_PLAN_PRO` | Pro 方案 Plan ID | `P-xxx...` |
| `ADSENSE_PUBLISHER_ID` | AdSense 发布商 ID | `ca-pub-xxx...` |
| `APP_URL` | 网站 URL | `https://yourdomain.com` |
| `COOKIE_DOMAIN` | Cookie 域名 | `.yourdomain.com` |

### 生成 JWT_SECRET
```bash
openssl rand -base64 48
```

---

## 部署步骤

### 1. 推送代码到 Git
```bash
git add .
git commit -m "Add AdSense, PayPal subscriptions, user auth"
git push
```

### 2. Vercel 自动部署
如果项目已关联 Vercel，推送代码会自动触发部署。

### 3. 首次部署后
1. 进入 Vercel Dashboard → 你的项目
2. 确认 **Storage** 中已关联 Postgres 数据库
3. 执行 `schema.sql` 初始化数据库表
4. 配置所有环境变量
5. 重新部署（Vercel Dashboard → Deployments → Redeploy）

### 4. 域名配置（可选）
1. Vercel Dashboard → **Settings** → **Domains**
2. 添加你的域名
3. 按提示配置 DNS 记录

---

## 测试流程

### 1. 本地测试

```bash
# 确保 .env.local 已配置
npm run dev
```

测试项目：
- [ ] 首页加载正常
- [ ] 图片上传和转换功能正常
- [ ] 免费用户看到广告占位
- [ ] 点击锁定功能弹出升级弹窗
- [ ] 登录/注册弹窗正常工作
- [ ] 定价页面展示正确
- [ ] 法律页面（隐私政策等）可正常访问
- [ ] 关于我们页面正常显示

### 2. PayPal Sandbox 测试

1. 在 [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts) 创建测试买家账号
2. 使用测试账号登录你的网站
3. 点击订阅按钮
4. 在 PayPal 弹窗中使用测试买家账号完成支付
5. 验证 Webhook 是否正确触发（检查数据库 subscriptions 表）
6. 验证会员权限是否正确生效

### 3. AdSense 测试

1. 确保 `ADSENSE_ENABLED=true` 且配置了 Publisher ID
2. 免费用户访问时应看到广告容器
3. 登录付费用户后广告容器应完全消失（DOM 中不存在）
4. 广告加载失败不应影响核心转换功能

### 4. 生产环境验证

部署后逐项检查：
- [ ] `https://yourdomain.com` 首页正常
- [ ] `https://yourdomain.com/#/pricing` 定价页正常
- [ ] `https://yourdomain.com/#/dashboard` 需登录才能访问
- [ ] `https://yourdomain.com/#/privacy` 等法律页面正常
- [ ] PayPal 订阅流程完整可用
- [ ] Webhook 回调正常更新订阅状态
- [ ] 广告仅对免费用户展示
- [ ] 会员登录后广告自动隐藏

---

## 常见问题

### Q: 广告不显示？
- 确认 AdSense 已审核通过
- 确认 Publisher ID 正确
- 新网站可能需要 24-48 小时才能开始展示广告
- 检查浏览器控制台是否有 AdSense 错误

### Q: PayPal 订阅不生效？
- 检查 Webhook URL 是否正确配置
- 检查 Webhook 事件类型是否全部选中
- 查看 Vercel Function Logs 确认 webhook 是否被调用
- 确认 Plan ID 与环境变量匹配

### Q: 数据库连接失败？
- 确认 Vercel Postgres 已正确关联
- 检查 POSTGRES_URL 环境变量是否已设置
- 确认已执行 schema.sql 建表

### Q: 登录后状态丢失？
- 检查 JWT_SECRET 环境变量是否配置
- 确认 Cookie 域名设置正确
- 生产环境需要 HTTPS（Cookie Secure 标志）
