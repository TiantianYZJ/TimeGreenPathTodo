// app.js
App({
  globalData: {
    changelogList: [
      {
        version: "2.1.2",
        date: "2026-01-18",
        content: [
          "待办项支持记录“创建时间”与“完成时间”",
          "重构“统计”页布局，新增“平均完成时间”“每日待办趋势”“完成时间分布”等丰富数据和图表",
          "优化“统计”页图片生成效果",
          "美化首页天气卡片，视觉更和谐",
          "优化“待办详情”页按钮布局，更符合用户习惯",
          "",
          "修复首页“清理”按钮直接显示二级确认窗口的问题",
          "修复已知问题"
        ]
      },
      {
        version: "2.1.1",
        date: "2025-07-20",
        content: [
          "美化首页天气卡片",
          "已收藏的待办支持自动置顶",
          "“更多”页新增“文本加密解密”小应用，可一键加密、解密文本",
          "“更多”页新增“密码生成器”，一键生成高安全性密码",
          "新增版本更新提示，让你不错过每一次升级",
          "优化公告处理逻辑",
          "待办详情页备注自动高亮超链接（目前暂不支持点击）",
          "修复已知问题"
        ]
      },
      {
        version: "2.1.0",
        date: "2025-07-15",
        content: [
          "更新“用户隐私保护指引”",
          "重新启用语音转文字服务，可以语音快速添加待办了",
          "顶部显示、待办详情页重新设计，视觉效果更舒适",
          "首页新增搜索框，一键搜索超方便",
          "首页、搜索结果页新增返回顶部按钮，一键直达顶部",
          "待办项支持在“详情”页收藏",
          "为附带地点信息的待办卡片添加“📍地点”标识",
          "为已收藏的待办卡片添加“⭐”标识",
          "“日历”页右下方新增“今”按钮，可一键回到今天日期",
          "“日历”页右下方新增“+”按钮，可直接添加选中的日期的待办",
          "修复已知问题"
        ]
      },
      {
        version: "2.0.2",
        date: "2025-06-14",
        content: [
          "首页“清空”新增“清空已完成待办”",
          "待办详情页支持更详细的时间显示",
          "因接口问题，暂时关闭语音转文字服务",
          "修复已知问题"
        ]
      },
      {
        version: "2.0.1",
        date: "2025-05-11",
        content: [
          "修复已知问题"
        ]
      },
      {
        version: "2.0.0",
        date: "2025-05-05",
        content: [
          "设计风格焕新升级，更有沉浸感",
          "待办支持添加详细时间点（小时、分钟）",
          "添加新手教程",
          "首页添加所在地天气显示",
          "“+”按钮上方新增语音识别按钮，添加待办更方便",
          "日历组件全新升级，支持更丰富的动效和视觉效果",
          "“日历”页代办卡片支持滑动、点击、修改完成状态",
          "修复“日历”页待办项循环加载的问题",
          "“统计”页支持一键生成报告，可选分享好友或保存本地",
          "“更多”页新增“鸣谢”页面，感谢为本小程序开发做出过贡献的人们",
          "“更多”页新增“支持与推广”页面",
          "“更多”页新增“今天吃什么”小应用，解决你的选择困难症",
          "修复已知问题"
        ]
      },
      {
        version: "1.4.2",
        date: "2025-04-25",
        content: [
          "“更多”-“数据管理”页生成数据包后支持一键转发，可发给自己/朋友",
          "美化“公告”页",
          "美化“更新日志”页",
          "修复已知问题"
        ]
      },
      {
        version: "1.4.1",
        date: "2025-04-20",
        content: [
          "新增公告栏",
          "优化界面交互体验",
          "“日历”页支持查看当天待办（基础框架已支持，后续将加入更多功能）",
          "修复已知问题"
        ]
      },
      {
        version: "1.4.0",
        date: "2025-04-13",
        content: [
          "小程序组件框架全面焕新升级，使用TDesign组件",
          "优化首页设计语言与操作逻辑，待办卡片左滑唤出菜单",
          "首页“+”支持拖动",
          "首页卡片左滑、详情页支持分享待办给好友",
          "待办添加、编辑页面组件升级，可在日历视图选择日期，面对日期不再迷茫",
          "“日历”页支持查看日历视图，显示当天待办数据，一目了然",
          "“更多”页优化操作逻辑",
          "修复了一些已知BUG"
        ]
      },
      {
        version: "1.3.0",
        date: "2025-04-06",
        content: [
          "新增“更多”板块，支持数据导入、导出等功能",
          "新增“日历”板块，后续功能有待完善",
          "解决待办详情页标题过长导致溢出页面的问题",
          "“统计”板块新增“位置分布”、“地点分布图”数据，更直观",
          "待办详情页支持长按复制信息",
          "修复了一些已知BUG"
        ]
      },
      {
        version: "1.2.1",
        date: "2025-04-05",
        content: [
          "待办支持添加位置信息，同时支持一键导航",
          "将“截止时间”改为“日期”"
        ]
      },
      {
        version: "1.2.0",
        date: "2025-04-05",
        content: [
          "支持更丰富的附加数据",
          "优化待办卡片设计",
          "添加完成时待办卡片的颜色渐变效果",
          "点击待办卡片支持查看待办详情",
          "待办详情页支持修改待办"
        ]
      },
      {
        version: "1.1.0",
        date: "2025-04-04",
        content: [
          "新增tabbar导航栏",
          "新增统计页面",
          "更换小程序名称、图标"
        ]
      },
      {
        version: "1.0.0",
        date: "2025-04-03",
        content: [
          "去除“（体验版）”标识"
        ]
      }
    ],

    ///////////////////////////////////////////////////////////////////////////////////////////
    notices: [
      { version: "2.1.2" },
//         title: "2025年10月1日-更新预告（V3.0.0）",
//         date: "2025-10-01",
//         content: `国庆快乐！前段时间比较忙所以没时间更新，这次国庆先做个小预告
// 未来更新将包含以下内容：
// 1、将小程序转为uniapp框架，为日后开发做铺垫；
// 2、将修复已知问题。
// 3、更多更新敬请期待……

// 历史更新请前往 “更多”->“更新日志” 查看。
// 有问题欢迎在 右上角“···”->“反馈与投诉” 说明，谢谢！`
//       },
      { version: "2.1.1" },
      { version: "2.1.0" },
      { version: "2.0.1" },
      {
        title: "2025年5月5日-更新公告（V2.0.0）",
        date: "2025-05-05",
        content: `祝大家劳动节快乐！这次小长假憋了个大版本更新，让我们共同拥抱2.0.0版本！
本次更新包含以下内容：
1、设计风格焕新升级，更有沉浸感；
2、待办支持添加详细时间点（小时、分钟）；
3、添加新手教程；
4、首页添加所在地天气显示；
5、“+”按钮上方新增语音识别按钮，添加待办更方便；
6、日历组件全新升级，支持更丰富的动效和视觉效果；
7、“日历”页代办卡片支持滑动、点击、修改完成状态；
8、修复“日历”页待办项循环加载的问题；
9、统计”页支持一键生成报告，可选分享好友或保存本地；
10、“更多”页新增“鸣谢”页面，感谢为本小程序开发做出过贡献的人们！
11、“更多”页新增“支持与推广”页面；
12、“更多”页新增“今天吃什么”小应用，解决你的选择困难症；
13、修复已知问题。

历史更新请前往 “更多”->“更新日志” 查看。
有问题欢迎在 右上角“···”->“反馈与投诉” 说明，谢谢！`
      },
      { version: "1.4.2" },
      {
        title: "暂停维护说明",
        date: "2025-04-20",
        content: `本人为初中生，因临近期中考及生地会考，学习进度紧张，所以做出暂停维护的决定。今后（2025.4.20至2025.7）将不定期进行更新，拟7月份后继续维护。谢谢理解！`
      },
      { version: "1.4.1" },
      { version: "1.4.0" },
      { version: "1.3.0" },
      { version: "1.2.1" },
      { version: "1.2.0" },
      { version: "1.1.0" },
      { version: "1.0.0" },
    ],

    weather: null,

    //--状态栏NEW
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuTop: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
  },

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
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function(options){
    // wx.cloud.init({
    //   //云环境id
    //   env:'cloud1-5go69ap19a9dc8e2'
    // }),
    // 新增公告处理逻辑
    this.processNotices();

    this.updateCalendarCache(wx.getStorageSync('todos') || []);
    this.login()  // 调用

    //--状态栏NEW
    const that = this;
    // 获取系统信息
    const systemInfo = wx.getWindowInfo();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    // 导航栏高度 = 状态栏高度 + 44
    that.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
    that.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    that.globalData.menuTop=  menuButtonInfo.top;
    that.globalData.menuHeight = menuButtonInfo.height;

    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    });
  },
 
  login:function(){
    // wx.login()获取code
    wx.login({
      success:(res)=>{
        console.log("code: " + res.code);
      }
    })
  },

  // 新增公告处理方法
  processNotices() {
    const processed = this.globalData.notices.map(notice => {
      if (!notice.version) return notice; // 保留手动维护的公告
      
      // 查找对应版本更新日志
      const changelog = this.globalData.changelogList.find(
        item => item.version === notice.version
      );
      
      if (!changelog) {
        console.warn(`未找到版本 ${notice.version} 的更新日志`);
        return null;
      }

      // 自动生成公告内容
      return {
        title: `${changelog.date.replace(/-/g, '年').replace(/-/, '月')}日-更新公告（V${changelog.version}）`,
        date: changelog.date,
        content: `本次更新包含以下内容：\n${
          changelog.content
            .map((item, index) => `${index + 1}、${item}`)
            .join('\n')
        }\n\n历史更新请前往 “更多”->“更新日志” 查看。\n有问题欢迎在 右上角“···”->“反馈与投诉” 说明，谢谢！`
      };
    }).filter(Boolean);

    this.globalData.notices = processed;
  },


  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    this.checkVersionUpdate();
  },

  // 新增版本检测方法
  checkVersionUpdate() {
    const storedVersion = wx.getStorageSync('appVersion') || '2.1.1'
    // 获取最新版本信息
    const latestVersionInfo = this.globalData.changelogList[0]
    
    if (this.compareVersion(latestVersionInfo.version, storedVersion) > 0) {
      // 格式化更新内容
      const updateContent = latestVersionInfo.content
        .slice(0, 3) // 显示前3条更新内容
        .map((item, index) => `${index + 1}、${item}`)
        .join('\n')
    
      wx.showModal({
        title: `发现新版本 ${storedVersion} → ${latestVersionInfo.version}`,
        content: `更新日期：${latestVersionInfo.date}\n更新内容：\n${updateContent}${latestVersionInfo.content.length > 3 ? '\n...' : ''}`,
        confirmText: '立即体验',
        cancelText: '查看详情',
        success: res => {
          if (res.confirm) {
            wx.setStorageSync('appVersion', latestVersionInfo.version)
          } else if (res.cancel) {
            wx.navigateTo({
              url: '/pages/changelog/changelog'
            })
          }
        }
      })
    }
  },

  // 版本比较方法
  compareVersion: function(v1, v2) {
    v1 = v1.split('.').map(Number)
    v2 = v2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const n1 = v1[i] || 0
      const n2 = v2[i] || 0
      if (n1 !== n2) return n1 > n2 ? 1 : -1
    }
    return 0
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    console.error('全局错误捕获:', msg)
    wx.showToast({
      title: '程序开小差了，请尝试重启',
      icon: 'none',
      duration: 3000
    })
  },


})
