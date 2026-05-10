欢迎来到时光绿径待办！这是一个使用原生微信小程序框架构建的待办事项应用。本指南旨在帮助AI代理快速理解项目结构、核心功能和开发约定。

## 1. 项目概述

时光绿径待办是一款功能丰富的待办事项管理工具，致力于为用户提供简洁高效的任务管理体验。应用采用清爽的绿意设计风格，缓解事务焦虑，同时提供多种实用功能帮助用户更好地规划和完成每日任务。

### 核心功能

- ✅ **待办事项管理**：支持添加、编辑、删除、完成/未完成切换等基础操作
- ✅ **语音识别**：集成微信同声传译插件，支持语音快速创建待办
- ✅ **日历视图**：可视化展示每日待办事项，支持日期导航和快速添加
- ✅ **数据分析**：提供待办完成情况统计和可视化图表
- ✅ **搜索功能**：支持关键词搜索待办事项
- ✅ **位置信息**：支持为待办添加位置信息和一键导航
- ✅ **数据管理**：支持待办数据的导入、导出和备份
- ✅ **天气显示**：集成心知天气API，展示实时天气信息
- ✅ **小工具集**：提供文本加密解密、密码生成器、今天吃什么等实用小工具
- ✅ **版本更新**：自动检测版本更新并提示用户

## 2. 架构概览

- **框架**: 本项目使用**原生微信小程序**框架开发。所有代码遵循微信小程序的标准规范。
- **UI 组件库**: 项目深度集成 **TDesign Wechat Miniprogram (`tdesign-miniprogram`)**。所有新功能和页面都应优先使用此组件库中的组件，以保持 UI 风格统一。
- **数据存储**: 核心数据，特别是 `todos` 列表，完全存储在**用户本地**。通过 `wx.getStorageSync('todos')` 和 `wx.setStorageSync('todos', ...)` 进行读写。**没有后端数据库**，所有数据操作都是本地的。
- **全局状态管理**: 全局应用级别的状态和数据（如版本更新日志 `changelogList`、设备信息 `navBarHeight`）存储在 `app.js` 的 `globalData` 对象中。通过 `getApp()` 方法在任何页面中访问。
- **第三方库**: 项目使用了多种第三方库，包括 echarts-for-weixin（图表展示）、crypto-js（加密解密）、dayjs（日期处理）等。

## 3. 核心开发模式与约定

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

### 页面导航与参数传递

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

### 权限处理

应用需要获取用户的一些系统权限，包括：

- **位置权限**: 用于获取天气信息和位置导航
- **麦克风权限**: 用于语音识别功能
- **相册权限**: 用于保存图片到相册

权限处理应遵循以下原则：

1.  先检查权限状态，再请求权限
2.  如果用户拒绝权限，提供清晰的引导说明
3.  对于核心功能依赖的权限，提供系统设置引导

**示例: 麦克风权限处理**
```javascript
getRecordAuth: function() {
  wx.getSetting({
    success: (res) => {
      if (!res.authSetting['scope.record']) {
        wx.authorize({
          scope: 'scope.record',
          fail: () => {
            wx.showModal({
              title: '权限申请',
              content: '需要麦克风权限进行语音输入',
              success: (res) => {
                if (res.confirm) wx.openSetting()
              }
            })
          }
        })
      }
    }
  })
}
```

## 4. 数据模型

### 待办事项 (Todo) 结构

待办事项是应用的核心数据模型，包含以下字段：

```javascript
{
  text: '待办事项内容',        // 待办事项的标题或核心内容
  setDate: '2025-04-03',      // 待办事项的日期（YYYY-MM-DD格式）
  setTime: '14:30',           // 待办事项的时间（HH:MM格式）
  remarks: '备注信息',         // 待办事项的详细说明或备注
  location: {                 // 待办事项的位置信息（可选）
    name: '位置名称',
    address: '详细地址',
    latitude: 39.9087,
    longitude: 116.3975
  },
  completed: false,           // 待办事项的完成状态
  time: '2025-04-03 10:00:00' // 待办事项的创建时间
}
```

### 全局数据结构

在 `app.js` 的 `globalData` 中存储了应用的全局状态：

```javascript
{
  changelogList: [],          // 版本更新日志列表
  notices: [],                // 公告列表
  weather: null,              // 天气数据
  navBarHeight: 0,            // 导航栏高度
  menuRight: 0,               // 胶囊按钮右间距
  menuTop: 0,                 // 胶囊按钮顶部间距
  menuHeight: 0,              // 胶囊按钮高度
  calendarCache: {}           // 日历视图缓存
}
```

## 5. 核心功能实现

### 语音识别功能

语音识别功能通过微信同声传译插件实现，核心逻辑位于 `pages/todo/todo.js`：

```javascript
// 引入插件
const plugin = requirePlugin('WechatSI');
const manager = plugin.getRecordRecognitionManager();

// 初始化语音识别
initRecord: function () {
  const that = this;
  // 有新的识别内容返回时触发
  manager.onRecognize = function (res) {
    that.setData({ content: res.result });
  }
  // 识别结束时触发
  manager.onStop = function (res) {
    var text = res.result;
    if (text) {
      wx.navigateTo({
        url: `/pages/add-todo/add-todo?voiceText=${encodeURIComponent(text)}`
      });
    }
  }
}
```

### 天气信息获取

天气信息通过心知天气API获取，核心逻辑位于 `pages/todo/todo.js`：

```javascript
loadWeather() {
  const that = this;
  wx.getLocation({
    type: 'wgs84',
    success: (locationRes) => {
      wx.request({
        url: 'https://api.seniverse.com/v3/weather/now.json',
        data: {
          key: weatherKey,
          location: `${locationRes.latitude}:${locationRes.longitude}`,
          language: 'zh-Hans',
          unit: 'c'
        },
        success(res) {
          if (res.data.results?.[0]?.now) {
            // 处理并存储天气数据
            const weatherData = res.data.results[0];
            getApp().globalData.weather = {
              city: weatherData.location.name,
              text: weatherData.now.text,
              temperature: weatherData.now.temperature,
              // ... 其他天气数据
            };
          }
        }
      });
    }
  });
}
```

### 日历视图实现

日历视图使用第三方日历组件 `@lspriv/wx-calendar`，核心逻辑位于 `pages/calendar/calendar.js`。日历缓存机制在 `app.js` 中实现：

```javascript
updateCalendarCache(todos) {
  const cache = {};
  todos.forEach(todo => {
    const date = new Date(todo.setDate);
    const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    
    if (!cache[key]) {
        cache[key] = {
            count: 0,
            sampleText: todo.text
        };
    }
    cache[key].count++;
  });
  
  this.globalData.calendarCache = cache;
}
```

## 6. 页面结构与功能

### 主要页面

| 页面路径 | 功能描述 |
|---------|---------|
| `/pages/todo/todo` | 首页，展示待办事项列表，提供添加、搜索、语音识别等功能 |
| `/pages/add-todo/add-todo` | 添加和编辑待办事项页面 |
| `/pages/calendar/calendar` | 日历视图页面，展示每日待办事项 |
| `/pages/stats/stats` | 统计分析页面，展示待办完成情况 |
| `/pages/more/more` | 更多功能页面，提供数据管理、小工具等入口 |
| `/pages/todo-detail/todo-detail` | 待办事项详情页面 |
| `/pages/todo-search/todo-search` | 待办搜索结果页面 |

### 小工具页面

| 页面路径 | 功能描述 |
|---------|---------|
| `/pages/text-encryptor/text-encryptor` | 文本加密解密工具 |
| `/pages/password-generator/password-generator` | 密码生成器 |
| `/pages/eating/eating` | 今天吃什么随机选择工具 |
| `/pages/datamanage/datamanage` | 数据导入导出管理 |

## 7. 开发规范与约定

### 代码风格

- 遵循微信小程序代码规范
- 使用4个空格进行缩进
- 变量命名采用驼峰命名法
- 函数命名清晰，描述其功能
- 关键代码添加注释说明

### UI设计规范

- 优先使用TDesign组件库
- 保持清爽的绿意设计风格
- 确保界面简洁易用
- 考虑不同屏幕尺寸的适配

### 性能优化

- 减少不必要的setData调用
- 使用本地缓存减少网络请求
- 图片资源进行适当压缩
- 长列表使用分页或虚拟列表

### 错误处理

- 全局错误捕获在app.js的onError中实现
- 网络请求和API调用添加错误处理
- 对用户操作提供清晰的反馈

## 8. 版本管理

应用采用语义化版本号管理，版本更新信息存储在 `app.js` 的 `changelogList` 中。版本更新逻辑包括：

1.  自动检测版本更新
2.  显示更新内容提示
3.  支持查看历史更新日志

## 9. 总结

时光绿径待办是一款功能丰富、设计精美的微信小程序，专注于为用户提供高效的待办事项管理体验。通过本指南，AI代理可以快速了解项目的核心架构、数据模型、功能实现和开发约定，从而更好地参与项目的开发和维护工作。

在开发过程中，请始终遵循项目的开发规范和约定，确保代码的质量和一致性。如果有任何疑问或需要进一步了解某个功能的实现细节，请参考相关页面的源代码或咨询项目负责人。