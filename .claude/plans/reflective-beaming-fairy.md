# packageAdmin 改造清单

## 背景

`packageAdmin` 是仅限所有者和指定管理员进入的后台管理分包。两点问题：
1. **UI 视觉差**（第二阶段改造）
2. **管理员视图不完整**（第一阶段改造）—— todo-detail / combo-detail 预览时信息过于精简，缺少监管所需数据

---

## 阶段一：管理员视图功能增强

### 1. 新增管理端 API 端点

需要在后端新增以下接口，供 adminView 调用：

| 方法 | 端点 | 用途 | 返回数据 |
|------|------|------|---------|
| GET | `/admin/todo/{todoId}?userId=X` | 获取指定待办完整数据 | 待办全部字段 + subtask 树 + combo 信息 |
| GET | `/admin/todo/{todoId}/comments?page=1&pageSize=20` | 获取待办的评论列表 | 分页评论列表（含回复层级） |

### 2. todo-detail 页面增强

#### 2.1 数据加载路径重构

当前 3 种 admin → todo-detail 的导航路径统一改造：

**路径 A：admin/index → todo-detail（个人待办）**
- 当前：URL 编码 todoData + creator
- 改为：传递 `adminView=1&todoId=X&userId=Y`
- todo-detail 通过新 API `/admin/todo/{todoId}?userId=Y` 获取完整数据

**路径 B：admin/user-detail → todo-detail（个人待办）**
- 当前：同上
- 改为：同上，传递 todoId + userId，调用 admin API

**路径 C：admin/combo-detail → todo-detail**
- 个人待办：当前走本地存储。改为通过 admin API 加载：`todoId` + `userId` + 新 API
- 共享待办：当前走 `sharedTodoId` + `comboId`（API 已有）。追加 `adminView=1`

**路径 D：admin/combo-detail → 共享待办详情**
- 当前：`sharedTodoId` + `comboId` → 加载正常页面
- 改为：追加 `adminView=1`，页面读 `sharedTodoId` + `comboId` 路线，但应用 adminView 只读约束

#### 2.2 adminView 交互增强

| 功能 | 当前状态 | 改造后 |
|------|---------|--------|
| 子任务 | 完全隐藏 | **只读点状列表**（复用 isShare 的只读 subtask 模板，不可 toggle/编辑/新增/删除） |
| 评论 | 完全隐藏 | **只读浏览 + 可删除**。评论区弹出层中展示评论列表（新 API 加载），不可发表/回复，但保留删除按钮（监管能力） |
| 完成进度 | 不展示 | 如果是共享待办，在标题区下方显示完成进度条（如 3/5 已完成） |
| 组合归属 | 不展示 | 如果有 combo_id，显示组合名称 badge，可点击跳转 combo-detail（带 adminView=1） |
| 子任务加载 | 无 | 新 API 加载 subtask 树 |
| 评论加载 | 无 | 新 API 分页加载评论 |
| 评论删除 | 不可用 | 调用已有 `adminApi.deleteComment(id)` |
| 下拉刷新 | 直接 return | 调用 admin API 重新加载（防丢失 adminView 上下文） |

### 3. combo-detail 页面增强

| 功能 | 当前状态 | 改造后 |
|------|---------|--------|
| 筛选器状态 | 未初始化（按钮可能无文字） | 默认"全部"筛选模式，设置筛选文字 |
| 下拉刷新 | `onPullDownRefresh` 错调普通 `loadComboData` | 检测 `adminView` 分支，调用 `loadComboDataForAdmin` |
| 导航 → todo-detail（个人待办） | 不传 `adminView`，走 `todoId` 本地存储 | 传入 `adminView=1&todoId=X&userId=Y`，走 admin API |
| 导航 → todo-detail（共享待办） | 不传 `adminView` | 追加 `adminView=1` |

### 4. 关键文件改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `packagePages/todo-detail/todo-detail.js` | 核心 | 新增 `_loadAdminViewWithApi()` 方法，处理 admin API 加载；新增 subtask 只读展示逻辑；新增评论只读+删除逻辑 |
| `packagePages/todo-detail/todo-detail.wxml` | 模板 | 修改 `adminView` 条件判断，启用只读 subtask 区域；修改评论区条件启用 adminView 可浏览模式 |
| `packagePages/todo-detail/todo-detail.wxss` | 样式 | subtask 只读区样式微调 |
| `packageCombo/combo-detail/combo-detail.js` | 核心 | `navigateToDetail` 增加 adminView 传递；`navigateToSharedDetail` 追加 adminView；`onPullDownRefresh` adminView 分支；筛选器初始化 |
| `packageAdmin/index/index.js` | 导航 | todo-detail 跳转参数改为 `todoId` + `userId`（不再用 URL 编码完整对象） |
| `packageAdmin/user-detail/user-detail.js` | 导航 | 同上 |
| `utils/api.js` | 新增 | adminApi 新增 `getTodoDetail(todoId, userId)` 和 `getTodoComments(todoId, page, pageSize)` |

---

## 阶段二：UI 视觉升级（后续实施）

- 所有 admin 页面卡片毛玻璃化（复用主应用 `.glass-card` 视觉语言）
- 统计卡片/列表卡片错峰弹跳入场
- 底部弹出层已有毛玻璃保持不变

---

## 验证方式

1. 从 admin/index → todo-detail：能否看到只读子任务列表
2. 从 admin/index → todo-detail：能否浏览评论 + 删除评论
3. 从 admin/user-detail → todo-detail：同上
4. 从 admin/combo-detail → todo-detail：adminView 上下文是否保持
5. combo-detail 下拉刷新是否走 admin 分支
6. 各种导航深度回溯时 adminView 不丢失
