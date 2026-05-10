# 时光绿径待办 (TimeGreen Path Todo) AI 编程指南

欢迎来到时光绿径待办！这是一个使用原生微信小程序框架构建的待办事项应用。本指南旨在帮助 AI 代理快速理解项目结构和核心开发模式。

## 1. 架构概览

- **框架**: 本项目使用**原生微信小程序**框架开发。所有代码遵循微信小程序的标准规范。
- **UI 组件库**: 项目深度集成 **TDesign Wechat Miniprogram (`tdesign-miniprogram`)**。所有新功能和页面都应优先使用此组件库中的组件，以保持 UI 风格统一。
- **数据存储**: 核心数据，特别是 `todos` 列表，完全存储在**用户本地**。通过 `wx.getStorageSync('todos')` 和 `wx.setStorageSync('todos', ...)` 进行读写。**没有后端数据库**，所有数据操作都是本地的。
- **全局状态管理**: 全局应用级别的状态和数据（如版本更新日志 `changelogList`、设备信息 `navBarHeight`）存储在 `app.js` 的 `globalData` 对象中。通过 `getApp()` 方法在任何页面中访问。

## 2. 核心开发模式与约定

### 待办事项 (Todo) 数据流

这是应用的核心。在对 `todos` 列表进行任何增、删、改操作后，**必须**执行以下两个步骤来确保数据一致性：

1.  **持久化到本地存储**:
    ```javascript
    wx.setStorageSync('todos', updatedTodos);
    ```
2.  **更新日历视图缓存**: 为了让日历页面能正确显示待办标记，需要调用 `app.js` 中的全局方法。
    ```javascript
    getApp().updateCalendarCache(updatedTodos);
    ```

**示例: 在 `pages/todo/todo.js` 中删除一个待办事项**
```javascript
// ...
const todos = that.data.todos.filter((_, i) => i !== index);
that.setData({ todos });
wx.setStorageSync('todos', todos); // 步骤 1
getApp().updateCalendarCache(todos); // 步骤 2
// ...
```

### 页面导航

- 使用 `wx.navigateTo({ url: '...' })` 进行页面跳转。
- 页面路径在 `app.json` 的 `pages` 数组中定义。
- 向目标页面传递数据时，使用 URL 查询参数。如果传递复杂对象（如 `todo.location`），需要先用 `JSON.stringify` 序列化，再用 `encodeURIComponent` 编码。

```javascript
// 从 pages/todo/todo.js 跳转到编辑页
const todo = this.data.todos[index];
wx.navigateTo({
  url: `/pages/add-todo/add-todo?edit=1&index=${index}&text=${encodeURIComponent(todo.text)}&location=${encodeURIComponent(JSON.stringify(todo.location))}`
});
```

### 外部 API

- **天气服务**: 天气数据通过 `pages/todo/todo.js` 中的 `loadWeather` 方法从心知天气 API (`api.seniverse.com`) 获取。API 密钥硬编码在文件中。
- **语音识别**: 语音转文字功能通过微信官方插件 `WechatSI` 实现。相关逻辑封装在 `pages/todo/todo.js` 的 `initRecord` 和 `touchStart`/`touchEnd` 方法中。

## 3. 关键文件和目录

- `app.js`: 小程序入口文件，管理全局数据和生命周期。
- `app.json`: 全局配置文件，定义页面、Tab Bar、权限等。
- `pages/`: 存放所有小程序页面。
  - `pages/todo/`: 应用的核心页面，包括待办列表的展示和主要交互。
  - `pages/add-todo/`: 添加和编辑待办事项的表单页面。
  - `pages/calendar/`: 日历视图，展示每日的待办概览。
- `miniprogram_npm/tdesign-miniprogram/`: TDesign UI 组件库。
- `utils/`: 存放工具函数。

在开始编码前，请确保你已熟悉以上约定。这将帮助你编写出符合项目规范的高质量代码。
