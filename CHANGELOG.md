# 更新日志

## V4.2.0 (2026-06-12 ~ 2026-06-21)

➕【新增｜独立分包】将管理后台、组合协作、子页面等拆分为独立分包，减少主包体积约40%，首次启动更快
➕【新增｜分包重构】10 个页面迁入 packagePages，修复 notice/guide markdown 路由
➕【新增｜AI 模式】创建独立分包 packageAI，接入微信 AI 开发模式（beta）
➕【新增｜AI 模式】AGENTS.md 全局提示词，定义 AI 助手回答风格和行为约束
➕【新增｜AI 模式】共享 API 基础设施（auth 中间件）
➕【新增｜AI 模式】todo-manager SKILL（6 原子接口 + 3 原子组件）
➕【新增｜AI 模式】combo-collab SKILL（4 原子接口 + 2 组件集）
➕【新增｜AI 模式】insights SKILL（7 原子接口 + 3 组件集）
➕【新增｜AI 模式】全部 17 个接口补全 outputSchema 声明
➕【新增｜AI 模式】原子组件生命周期、content 两段式、middleware 中间件日志
➕【新增｜AI 模式】原子卡片 tap 交互、sendFollowUpMessage、openDetailPage 半屏跳转
➕【新增｜AI 模式】search-results/starred-list/member-list 组件及路由
➕【新增｜AI 模式】补齐全部 7 个原子操作结果卡片组件
➕【新增｜AI 模式】统一组件设计语言（绿意风格 card/badge/shadow 体系）
➕【新增｜设计系统】DESIGN.md 绿意风格完整设计语言规范（token-based：色彩/字号/圆角/阴影/动画/布局）
➕【新增｜个人中心】时间问候、成长数据卡片、快捷操作网格、入场动画
➕【新增｜回收站】卡片式布局、微交互动画、阶梯入场效果
➕【新增｜登录页】全新布局（功能对比表 + t-icon + 底部按钮粘底）
➕【新增｜登录页】checkbox 扩展到协议文字，点击区域更友好
➕【新增｜登录页】普通用户注册后引导至 setup_profile 设置页，免弹窗强制
➕【新增｜登录页】QR 码四模式（need_login/setup_profile/confirm/success）统一视觉
➕【新增｜优先级】四象限全链路：数据库字段 + API + add-todo 选择器 + 列表色条 + 详情展示
➕【新增｜优先级】todo 页下拉筛选新增优先级分组（P1-P4）
➕【新增｜优先级】todo-detail 优先级卡片改为单行 flex 布局
➕【新增｜子任务】子任务体系：递归创建、展开/折叠、完成态联动
➕【新增｜子任务】子任务分享：微信快照 + 共享组合递归复制 + 只读展示
➕【新增｜子任务】flattenSubtree 算法优化，onLoad 拆分为 7 个子函数
➕【新增｜子任务】generateShareImage 417 行 → 8 个子函数
➕【新增｜语音识别】todo 页 mic FAB 全屏遮罩 + 中心实时文字 + 底部绿色波动光晕
➕【新增｜语音识别】同步语音遮罩到 combo-detail 页（@import 复用样式）
➕【新增｜管理视图】adminView：todo-detail API 加载 + 评论管理、combo-detail 刷新 + 筛选 + 导航传参
➕【新增｜长按菜单】todo 页卡片弹跳动画 + 毛玻璃操作菜单，原位克隆 + 贴边弹出动画
➕【新增｜弹窗毛玻璃】全应用 16 处 t-popup 底栏弹窗统一毛玻璃化
➕【新增｜日志系统】全局 logger + ~132 处 console 替换 + 远程 ERROR 上报
➕【新增｜待办存储】全量读写 → 增量写入，减少 I/O 开销
➕【新增｜后端性能】sync 批量 SQL，mergeChanges 冲突逻辑简化
➕【新增｜索引重建】getTodoIds 空索引时自动重建（reindexTodos）
➕【新增｜day-todos】分包页面骨架
➕【新增｜版本说明】最低基础库版本设置为 3.15.0

🛠️【修复｜样式继承】子包页面优先级色条改用 @import 统一继承，移除特化样式，消除重复渲染
🛠️【修复｜样式继承】子包页面覆盖 @import 导入的 .todo-item::before，消除重复色条
🛠️【修复｜后端查询】后端两处查询漏 priority 字段，导致组合 detail 色条不显示
🛠️【修复｜子任务同步】子任务同步 & 优先级丢失 & parent_id 字段名不统一
🛠️【修复｜优先级缺漏】全链路 priority 字段缺漏：本地存储 newTodo、addTodoFromChild、edit 传参
🛠️【修复｜优先级兜底】todo-detail 三个数据加载路径缺少 priority 兜底，旧待办不显示优先级
🛠️【修复｜数据库时区】数据库连接指定时区 +08:00，修复创建时间显示偏移
🛠️【修复｜sync 覆盖】sync.js 残留旧版 getLocalTodos/setLocalTodos 覆盖了新版本增量写入
🛠️【修复｜旧格式残留】清除全部残留旧格式读写，补全遗漏文件
🛠️【修复｜首页报错】移除不存在的方法 connectBluetooth() 调用，解决新用户首次进入时报错
🛠️【修复｜提审校验】移除 agent 块以通过提审校验（skill 路径需在独立分包内）
🛠️【修复｜分包声明】取消 packageAI 独立分包声明及引用，文件保留以适配提审
🛠️【修复｜编辑传参】edit 传值补 priority、delete 增加子待办检测、calendar 回收站修复
🛠️【修复｜登录跳转】登录态失效时阻止多次跳转 login 页叠加（并发 401 守卫）
🛠️【修复｜语音遮罩】wx:for="{{32}}" 改为 voiceWaveBars 数组（小程序需数组迭代）
🛠️【修复｜语音遮罩】onUnload 清理 setTimeout，消除内存泄漏
🛠️【修复｜语音遮罩】_voiceDone 守卫防止 onStop 与导航竞态条件
🛠️【修复｜子任务完成态】完成态恢复绿色渐变
🛠️【修复｜todo-detail】优先级卡片 end tag 显示问题 + 完成态对全部等级显示（含P2）
🛠️【修复｜完成态过滤】组合统计时未排除已删除项

✨【优化｜语音遮罩】clip-path circle() 扩散 → opacity 渐显渐隐，提升性能
✨【优化｜语音遮罩】新增提示"识别可能需要几秒钟，松手即可结束"
✨【优化｜优先级色条】阴影 → 左侧色条，更简洁清爽
✨【优化｜优先级色条】多次弧形精调，最终以 @import 统一分包样式
✨【优化｜卡片视觉】卡片阴影加深、已完成项灰度弱化、全局圆角统一 32rpx
✨【优化｜品牌色】品牌色统一 #00b26a，协作页危险操作橙色警告样式
✨【优化｜子任务交互】checkbox 改用 t-icon，交互细节优化
✨【优化｜文件清理】移除重复的 LICENSE.txt 文件
✨【优化｜wx:key】app.json 移除无效 permission/compilerOptions；wx:key 改为 *this
✨【优化｜登录流程】setup_profile 保存/跳过时检查 pendingShareData，不丢失组合邀请任务
✨【优化｜登录流程】btn-primary 恢复 flex:2 布局，同步 login-btn 视觉
✨【优化｜登录流程】昵称输入框添加 adjust-position 防键盘遮挡
✨【优化｜登录流程】微信昵称自动填充添加 bindnicknamereview 事件处理

### 版本说明
- 日期：2026-06-12 ~ 2026-06-21
- 首个提交：`afa3256` — V4.2.0 初始架构重构
- 前版本：V4.1.2（`ccbbaab`）
