# 更新日志

## [5.0.0] — 2026-06-13

### 🚀 AI 开发模式接入
- **【新增｜AI 模式】创建独立分包 packageAI，接入微信 AI 开发模式（beta）**
- **【新增｜SKILL 体系】构建 3 个 SKILL：todo-manager（6 接口）、combo-collab（4 接口）、insights（7 接口），共 17 个原子接口，17 个原子卡片**
- **【新增｜AGENTS.md】全局提示词，定义 AI 助手的回答风格和行为约束**
- **【新增｜全局提示词】AGENTS.md 定义 AI 行为规范**
- **【新增｜原子组件】实现 17 个组件：待办列表/详情/创建确认、组合列表/共享待办/成员列表、日历/统计/收藏/回收站/搜索/激励/美食，以及 complete/update/delete/restore/complete-shared 操作反馈卡**
- **【新增｜组件交互】tap 触发 sendFollowUpMessage 续接对话、openDetailPage 半屏跳转、setRelatedPage 路由配置**
- **【新增｜中间件】auth 中间件统一登录态处理，try-catch 保护避免单点崩溃**
- **【新增｜设计语言】DESIGN.md — 绿意风格完整 token 体系（色彩/字号/圆角32rpx/阴影/动画）**
- **【新增｜组件设计统一】所有原子卡片统一白底+32rpx圆角+box-shadow+品牌绿#00b26a点缀**
- **【新增｜outputSchema】全部 17 个接口补全返回结构声明**

### 🎨 登录页全新设计
- **【重设计｜布局】去掉白卡片，绿底 `#e3f5eb` + flex 弹性布局，按钮贴底**
- **【重设计｜对比表】登录前/后功能四行对比：本地→云端、无提醒→微信通知、单人→协作、单设备→多端**
- **【重设计｜元素】全 t-icon（零 emoji），箭头 42rpx + 120rpx 居中，文字 38rpx**
- **【重设计｜字号】logo 200rpx，标题 58rpx，按钮 38rpx，确认/成功 180rpx 大图标**
- **【新增｜setup_profile】普通用户注册后直接引导设置昵称和头像，skip/save 后检查 pendingShareData 跳转**
- **【新增｜功能对比】标准登录页展示「登录前 vs 登录后」能力对比表**
- **【优化｜agree 交互】文字区域点击切换 checkbox，catchtap 保护协议链接不被冒泡吞并**
- **【优化｜QR 模式】need_login/setup_profile/confirm/success 去掉白卡片，qr-body 弹性居中，统一 button 96rpx + 38rpx + 50rpx pill**
- **【优化｜用户精调】detect 分流/180rpx 图标/58rpx 标题/文案精简**

### 🛠️ 样式系统改造
- **【统一｜圆角】所有页面统一 32rpx 圆角（卡片/按钮/输入框/弹窗/tab）**
- **【统一｜品牌色】`#00b26a` 统一切换按钮、brand 绿；`#e3f5eb` 页面背景**
- **【修复｜trash 页】红色渐变→品牌绿，黄色警告卡→白卡+青左边框，`#10b981`→`#00b26a`，`30rpx`→`32rpx`，非标色值→token**
- **【修复｜tag-manage 页】登录卡 24rpx→32rpx，圆角 20rpx→32rpx，`::before` 矩形→16rpx 绿圆点，emoji→t-icon**
- **【修复｜join-collab 页】code-box 24rpx→32rpx，`#12b086`→`#00b26a`，橙色 tips→白卡+青左边框，`30rpx`→`28rpx`**
- **【修复｜base lib 配置】移除 app.json 中无效 permission scope.record/writePhotosAlbum，compilerOptions 移至 project.config.json**
- **【修复｜权限】app.json 移除无效 permission scope.record/writePhotosAlbum**

### 🐛 功能 Bug 修复
- **【修复｜组件路径】components/xxx → components/xxx/index 后缀（glass-easel 引擎要求）**
- **【修复｜组件文件命名】xxx-card.js → index.js（glass-easel 规范）**
- **【修复｜事件冒泡】bind:tap 改为 catch:tap，防止 checkbox 双击切换**
- **【修复｜Number() 强转】移除 comboId/todoId 上的 Number()，支持字符串 ID**
- **【修复｜getCalendar】getApp() 改为 wx.getStorageSync（AI 模式独立上下文不可用）**
- **【修复｜project.config.json】compileOptions 缺少逗号导致 JSON 解析错误**
- **【修复｜wx:key】combo.id 改为 *this（WXML 不支持点号嵌套 key）**
- **【修复｜运算符优先级】avatarUrl 判断加括号，避免 &&/|| 结合性 Bug**

### 📦 工程化
- **【新增｜wxa-skills-eval】安装 AI 模式评测工具（tools/ai-mode-skills）**
- **【新增｜DESIGN.md】绿意风格完整设计语言规范（token-based，16 章节，476 行）**
- **【新增｜CHANGELOG.md】更新日志维护规范**
- **【优化｜git 工作流】每次修改同时更新 CHANGELOG.md**
