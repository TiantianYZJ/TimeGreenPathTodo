# 时光绿径待办 Website 前端开发 — 上下文摘要

## 项目概况

**路径**: `website/`
**技术栈**: React 19 + TypeScript + Vite + Ant Design 5 + Zustand + ECharts
**目标**: 为微信小程序"时光绿径待办"开发现代化网页端前端

---

## 已完成功能（全部通过 `npx tsc --noEmit` + `npx vite build`）

### 核心待办功能

| 页面 | 文件 | 功能 |
|------|------|------|
| TodoList | `pages/todo/TodoList.tsx` | 首页待办列表，含统计Hero区、搜索关键词高亮、标签/组合筛选、星标、批量删除、骨架屏加载、错步入场动画 |
| TodoDetail | `pages/todo/TodoDetail.tsx` | 待办详情，含图片预览（Image.PreviewGroup）、位置导航（高德URI）、骨架屏加载 |
| TodoForm | `pages/todo/TodoForm.tsx` | 创建/编辑待办，含图片上传（canvas压缩>2MB）、位置选择（浏览器定位+手动输入）、支持`?date=YYYY-MM-DD`预填日期 |
| TodoSearch | `pages/todo/TodoSearch.tsx` | 搜索页 |

### 日历

| 页面 | 文件 | 功能 |
|------|------|------|
| CalendarView | `pages/calendar/CalendarView.tsx` | 日历视图 |
| DayTodos | `pages/calendar/DayTodos.tsx` | 单日待办，含时间排序、标签/位置显示、点击跳转详情、新建按钮（自动填充日期） |

### 组合与协作

| 页面 | 文件 | 功能 |
|------|------|------|
| ComboList | `pages/combo/ComboList.tsx` | 组合列表，骨架屏加载、错步入场 |
| ComboEdit | `pages/combo/ComboEdit.tsx` | 创建/编辑组合，含TDesign图标选择器（28类图标库）、8色预设、isShared开关、memberLimit |
| ComboDetail | `pages/combo/ComboDetail.tsx` | 组合详情，三Tab（共享待办/成员/加入申请）、共享待办CRUD（含图片上传+位置选择）、assignType三种模式、成员管理、评论系统（线程回复）、邀请码复制、骨架屏加载 |
| CollabJoin | `pages/collab/CollabJoin.tsx` | 加入协作，支持直接加入/申请加入 |

### 统计

| 页面 | 文件 | 功能 |
|------|------|------|
| StatsOverview | `pages/stats/StatsOverview.tsx` | 三Tab——"我的统计"（Hero区+完成率饼图）、"时段分布"（柱状图+高峰时段）、"平台统计"（公共数据+饼图），图表含aria-label无障碍 |

### 数据管理

- **DataManage** (`pages/data/DataManage.tsx`): JSON导入/导出（去重）
- **Trash** (`pages/data/Trash.tsx`): 回收站
- **TagManage** (`pages/tag/TagManage.tsx`): 标签管理

### 用户与系统

- **Login** (`pages/auth/Login.tsx`): 二维码登录
- **UserCenter** (`pages/user/UserCenter.tsx`): 用户中心
- **Notice** (`pages/system/Notice.tsx`): 公告
- **Changelog** (`pages/system/Changelog.tsx`): 更新日志
- **Admin系列** (`pages/admin/`): Dashboard/Users/Notices/Changelog/Comments/Database/Config

### UI/UX优化（基于UI/UX Pro Max设计系统）

- 全局 `focus-visible`、`prefers-reduced-motion`、卡片按压缩放、触摸目标 ≥44px
- 骨架屏组件 (`components/ui/Skeleton.tsx`): Skeleton / SkeletonCircle / SkeletonCard / SkeletonList / SkeletonStat / SkeletonStatsGrid
- 列表错步入场动画 (`animate-stagger` class, 每项30ms延迟)
- 图表 `aria-label` 无障碍文本摘要

---

## 关键架构决策

### 图标库

- **TDesign图标** (`tdesign-icons-react`)，`components/ui/TIcon.tsx` 封装
- 图标名存在 `config/iconCategories.ts`（28类、数百个图标）
- **不要使用** `@ant-design/icons` 的图标（历史遗留，部分页面仍存在，应逐步替换为TDesign）

### 图片上传

- 上传地址: `https://img.scdn.io/api/v1.php`，字段名 `image`
- 超过 2MB 先 canvas 压缩（max 1920px, quality 0.8）
- 最多 9 张图片

### 位置功能

- 浏览器 Geolocation API 获取当前位置
- 手动输入（名称、地址、经纬度）
- 导航使用高德URI: `https://uri.amap.com/marker?position=lng,lat&name=xxx`

### 状态管理（Zustand）

| Store | 文件 | 职责 |
|-------|------|------|
| authStore | `stores/authStore.ts` | 登录状态（persist到localStorage） |
| todoStore | `stores/todoStore.ts` | 待办CRUD、过滤、批量操作 |
| comboStore | `stores/comboStore.ts` | 组合+共享待办CRUD、成员管理、加入请求 |
| tagStore | `stores/tagStore.ts` | 标签管理 |
| uiStore | `stores/uiStore.ts` | 侧边栏、主题、移动端检测 |

### API服务层

- Axios客户端: `services/api/client.ts`（自动附加token、401登出、防缓存）
- 模块: `authApi` / `todoApi` / `comboApi` / `collabApi` / `tagApi` / `configApi` / `commentApi` / `notifyApi` / `adminApi`
- API文档: `backend/API.md`

### 类型定义

- `types/todo.ts`: Todo, CreateTodoData, LocationInfo
- `types/combo.ts`: Combo, ComboMember（**注意**: ComboMember 必须定义在 Combo 之前，避免循环导入）
- `types/collab.ts`: SharedTodo（含 location 字段）, CollabRequest, Comment

### 设计系统

- 品牌绿: `#00b26a`，背景: `#e3f5eb`
- CSS变量: `styles/tokens.css`
- 暗色模式: `[data-theme='dark']` 切换
- Ant Design主题: `styles/theme/index.ts`

---

## 未完成功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 密码生成器工具 | 低 | 小程序 `packageTools/password-generator/` 已实现，网页端未移植 |
| 今天吃什么工具 | 低 | 小程序 `packageTools/eating/` 已实现（130+菜品、历史记录、动画），网页端未移植 |
| 通知提醒UI | 中 | `notifyApi` 已定义（subscribe/schedule/getList/update/delete），但网页端无UI，需浏览器推送支持 |
| 致谢页 | 低 | 小程序 `packageTools/acknowledge/`，静态贡献者列表 |
| Ant Design图标→TDesign替换 | 中 | 部分页面仍用 `@ant-design/icons`，应统一为TDesign图标 |
| 代码分割优化 | 低 | build警告 chunk>500KB，可用 `manualChunks` 拆分 echarts/antd |

---

## 路由结构

```
/login          → Login（无布局）
/               → TodoList（首页）
/todo/new       → TodoForm
/todo/:id       → TodoDetail
/todo/:id/edit  → TodoForm
/search         → TodoSearch
/calendar       → CalendarView
/calendar/:date → DayTodos
/stats          → StatsOverview
/combos         → ComboList
/combos/new     → ComboEdit
/combos/:id     → ComboDetail
/combos/:id/edit→ ComboEdit
/collab/join    → CollabJoin
/tags           → TagManage
/data           → DataManage
/trash          → Trash
/user           → UserCenter
/notice         → Notice
/changelog      → Changelog
/admin          → AdminDashboard（需isAdmin）
/admin/users    → AdminUsers
/admin/notices  → AdminNotices
/admin/changelog→ AdminChangelog
/admin/comments → AdminComments
/admin/database → AdminDatabase
/admin/config   → AdminConfig
```

---

## 文件结构

```
website/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # 根布局
│   │   ├── Sidebar.tsx            # 桌面侧边栏
│   │   ├── Header.tsx             # 顶部导航
│   │   └── MobileTabBar.tsx       # 移动底栏
│   ├── auth/
│   │   ├── AuthGuard.tsx          # 路由守卫
│   │   └── QrCodeLogin.tsx        # 二维码登录
│   └── ui/
│       ├── TIcon.tsx              # TDesign图标封装
│       └── Skeleton.tsx           # 骨架屏组件集
├── config/
│   ├── app.config.ts              # 应用常量（API地址、Logo URL等）
│   ├── routes.tsx                 # 懒加载路由定义
│   └── iconCategories.ts          # TDesign图标分类（28类）
├── services/
│   ├── api/client.ts              # Axios实例
│   └── modules/                   # API模块（auth/todo/combo/collab/tag/config/comment/notify/admin）
├── stores/                        # Zustand状态管理
├── styles/
│   ├── tokens.css                 # CSS设计令牌（颜色、间距、阴影、圆角、动画）
│   ├── global.css                 # 全局样式（焦点、交互、暗色模式覆盖）
│   ├── animations.css             # 动画（fadeIn/shimmer/stagger）
│   └── theme/index.ts             # Ant Design主题配置
├── types/                         # TypeScript类型定义
├── hooks/                         # 自定义Hook（useAuth/useDebounce/useMediaQuery/usePolling）
└── pages/                         # 页面组件（见路由结构）
```

---

## 构建命令

```bash
cd website
npx tsc --noEmit          # 类型检查
npx vite build            # 生产构建
npm run dev               # 开发服务器
```

---

## 注意事项

1. **TIcon组件**: 使用 `<TIcon name="icon-name" size={20} />`，图标名见 `config/iconCategories.ts`
2. **SharedTodo类型**: 已含 `location: LocationInfo | null` 字段，`collabApi.createSharedTodo` 支持 images 和 location 参数
3. **comboStore.createSharedTodo**: 参数类型需包含 images 和 location
4. **循环导入**: `types/combo.ts` 中 ComboMember 必须定义在 Combo 之前
5. **ComboDetail Tabs**: 条件 tab 项用 `getTabItems()` 函数返回数组，**不要用条件展开语法**（esbuild解析报错）
6. **无障碍**: 所有图标按钮需 `aria-label`，图表需 `role="img"` + `aria-label` 文本摘要
7. **暗色模式**: 通过 `useUIStore` 的 `themeMode` 切换，`data-theme="dark"` 属性在 html 上
8. **设计令牌**: 使用 CSS 变量（如 `var(--color-primary)`），不要硬编码 hex 颜色
9. **动画**: 全局 `prefers-reduced-motion` 已处理，新动画用 `var(--duration-*)` 和 `var(--easing)` 变量
