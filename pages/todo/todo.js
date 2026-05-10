const app = getApp();
const weatherKey = 'SdnJZGqS_c7zVlCnj';

// 引入微信同声传译插件
const plugin = requirePlugin('WechatSI');
// 获取全局唯一的语音识别管理器
const manager = plugin.getRecordRecognitionManager();

Page({
  // ===========================
  // 数据定义
  // ===========================
  data: {
    inputValue: '',
    todos: [],
    searchKeywords: '', // 搜索关键词

    latestNoticeTitle: "",  // 最新公告标题
    latestNoticeContent: "", // 最新公告内容

    isDragging: false,
    currentIndex: -1,
    startY: 0,
    offsetY: 0,

    // 语音相关
    recordState: false, // 录音状态
    content: '', // 识别的内容

    scrollTop: 0,
    showBackTop: false, // 返回顶部按钮显示控制

    // 导航栏相关
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuTop: app.globalData.menuTop,
    menuHeight: app.globalData.menuHeight,
  },

  // ===========================
  // 生命周期函数
  // ===========================
  
  /**
   * 页面加载
   */
  onLoad() {
    // 加载待办事项数据
    const todos = wx.getStorageSync('todos');
    
    // 首次使用时初始化默认数据
    if (!todos || todos.length === 0) {
      this.initDefaultTodos();
    } else {
      this.setData({ todos });
    }

    // 初始化语音识别
    this.initRecord();
    
    // 加载最新公告
    const notices = app.globalData.notices || [];
    if (notices.length > 0) {
      this.setData({
        latestNoticeTitle: notices[0].title + " ",
        latestNoticeContent: notices[0].content,
        weather: getApp().globalData.weather 
      });
    }

    // 强制刷新天气数据
    this.loadWeather();
  },

  /**
   * 页面显示
   */
  onShow() {
    // 从本地存储加载最新待办数据
    const todos = wx.getStorageSync('todos') || [];
    this.setData({ 
      todos,
      isLoading: true  // 确保初始状态为加载中
    });
    
    // 检查位置权限
    this.checkLocationPermission();
    // 获取录音授权（当前已注释，仅在需要时调用）
    // this.getRecordAuth();
  },

  // ===========================
  // 分享功能
  // ===========================
  
  /**
   * 分享到微信朋友
   */
  onShareAppMessage() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    };
  },

  // ===========================
  // 搜索功能
  // ===========================
  
  /**
   * 搜索输入处理
   */
  onSearchInput(e) {
    this.setData({
      searchKeywords: e.detail.value.trim()
    });
  },

  /**
   * 搜索提交
   */
  onSearchConfirm() {
    const keywords = this.data.searchKeywords.split(' ').filter(k => k);
    if (keywords.length === 0) return;

    wx.navigateTo({
      url: `/pages/todo-search/todo-search?keywords=${encodeURIComponent(keywords.join(','))}`
    });
  },

  // ===========================
  // 待办事项管理
  // ===========================
  
  /**
   * 初始化默认待办数据
   */
  initDefaultTodos() {
    const defaultTodos = [
      {
        text: '欢迎使用时光绿径待办！',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: '您的每日任务足迹管家',
        completed: false,
        time: Date.now()
      },
      {
        text: '点击右下角“+”按钮',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: '创建你的第一个待办',
        completed: false,
        time: Date.now()
      },
      {
        text: '试试语音快速创建待办',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: '按下底部麦克风按钮后说话，松手结束',
        completed: false,
        time: Date.now()
      },
      {
        text: '点击︎待办卡片可查看待办详情',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: `◆ 高效管理，一步到位
✅ 待办事项支持多种附加信息，支持一键地点导航（医院/写字楼/社区一键直达）
✅ 可视化数据看板，待办完成情况进度条+地理位置图，数据看得见
 
◆ 匠心设计，持续进化
✅ 清爽绿意界面，缓解事务焦虑
✅ 每周迭代升级，已更新数十项实用功能（位置显示/长按复制/数据分析等）

◆数据安全，保驾护航
✅ 数据本地储存不上云，有效防止数据泄露
✅ 数据随时导出分享，可转发分享好友
✅ 数据支持一键恢复，重要事务永不遗漏`,
        completed: false,
        time: Date.now()
      },
      {
        text: '点击右侧方框即可完成待办',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: '再次点击取消完成',
        completed: false,
        time: Date.now()
      },
      {
        text: '←——————按住后滑动︎●',
        setDate: new Date().toISOString().split('T')[0],
        setTime: '12:00',
        remarks: '可快速编辑、删除待办',
        completed: false,
        time: Date.now()
      },
    ];

    this.setData({ todos: defaultTodos });
    wx.setStorageSync('todos', defaultTodos);
    getApp().updateCalendarCache(defaultTodos);
  },

  /**
   * 切换待办完成状态
   */
  toggleTodo(e) {
    const index = e.currentTarget.dataset.index;
    const todos = this.data.todos.map((item, i) => 
      i === index ? {...item, completed: item.completed ? false : Date.now()} : item
    );
    
    this.setData({ todos });
    wx.setStorageSync('todos', todos);
  },

  /**
   * 删除待办事项
   */
  deleteTodo(index) {
    const that = this;
    wx.showModal({
      title: '删除确认',
      content: '该操作不可撤销，确定继续吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          that.setData({
            [`todos[${index}]._animate`]: 'remove-animation'
          }, () => {
            setTimeout(() => {
              const todos = that.data.todos.filter((_, i) => i !== index);
              that.setData({ todos });
              wx.setStorageSync('todos', todos);
              getApp().updateCalendarCache(todos);
            }, 300);
          });
        }
      }
    });
  },

  /**
   * 编辑待办事项
   */
  editTodo(index) {
    const todo = this.data.todos[index];
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?edit=1&index=${index}&text=${encodeURIComponent(todo.text)}&setDate=${todo.setDate}&setTime=${todo.setTime || '12:00'}&remarks=${encodeURIComponent(todo.remarks || '')}&location=${encodeURIComponent(JSON.stringify(todo.location))}&time=${todo.time}&isStar=${todo.isStar || false}`
    });
  },

  /**
   * 从子页面添加待办事项
   */
  addTodoFromChild(text, setDate, setTime, remarks, location) {
    const newTodo = {
      text,
      setDate,
      setTime,
      remarks,
      location,
      completed: false,
      time: Date.now()
    };
    
    const todos = [newTodo, ...this.data.todos];
    this.setData({ todos });
    wx.setStorageSync('todos', todos);
    getApp().updateCalendarCache(todos);
  },

  /**
   * 显示清空选项
   */
  showClearOptions() {
    wx.showActionSheet({
      itemList: ['清空所有待办', '清空已完成待办'],
      success: (res) => {
        if (res.tapIndex === 0) { // 清空所有待办
          this.showClearConfirm();
        } else if (res.tapIndex === 1) { // 清空已完成待办
          this.handleClearCompleted();
        }
      },
      fail: (err) => {
        console.log('用户取消选择', err);
      }
    });
  },

  /**
   * 清空已完成待办
   */
  handleClearCompleted() {
    wx.showModal({
      title: '确认清空已完成待办吗',
      content: '将永久删除所有已完成待办',
      confirmText: '立即清空',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const originalLength = this.data.todos.length;
          const todos = this.data.todos.filter(item => !item.completed);
          this.setData({ todos });
          wx.setStorageSync('todos', todos);
          getApp().updateCalendarCache(todos);
          wx.showToast({
            title: `已清除共 ${originalLength - todos.length} 项待办`,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 显示清空所有待办确认
   */
  showClearConfirm() {
    wx.showModal({
      title: '清空确认',
      content: '这将永久删除所有待办事项，确定继续吗？',
      confirmText: '彻底清空',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.showFinalConfirm();
        }
      }
    });
  },

  /**
   * 最后一次确认清空所有待办
   */
  showFinalConfirm() {
    wx.showModal({
      title: '最后一次确认',
      content: '此操作不可恢复！请再次确认',
      confirmText: '我确定',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          this.clearAllTodos();
        }
      }
    });
  },

  /**
   * 清空所有待办事项
   */
  clearAllTodos() {
    this.setData({ todos: [] });
    wx.setStorageSync('todos', []);
    app.updateCalendarCache([]);
    wx.showToast({
      title: '已清空',
      icon: 'success',
      duration: 2000
    });
  },

  // ===========================
  // 拖拽排序功能
  // ===========================
  
  /**
   * 开始拖拽
   */
  startDrag(e) {
    wx.vibrateShort({ type: 'medium' }); // 添加短震动反馈

    const index = e.currentTarget.dataset.index;
    this.setData({
      isDragging: true,
      currentIndex: index,
      startY: e.touches[0].pageY
    });

    // 禁止页面滚动
    wx.pageScrollTo({
      scrollTop: this.data.scrollTop,
      duration: 0
    });
  },

  /**
   * 拖拽移动处理
   */
  handleTouchMove(e) {
    if (!this.data.isDragging) return;
    
    const { currentIndex, startY } = this.data;
    const touch = e.touches[0];
    const deltaY = touch.pageY - startY;
    
    // 更新偏移量
    this.setData({
      offsetY: deltaY,
      [`todos[${currentIndex}]._offset`]: deltaY
    });
    
    // 实时排序逻辑
    if (Math.abs(deltaY) > 60) {
      const newIndex = currentIndex + (deltaY > 0 ? 1 : -1);
      if (newIndex >= 0 && newIndex < this.data.todos.length) {
        const todos = [...this.data.todos];
        const movedItem = todos.splice(currentIndex, 1)[0];
        todos.splice(newIndex, 0, movedItem);
        
        this.setData({
          todos,
          currentIndex: newIndex,
          startY: touch.pageY
        });
      }
    }
  },

  /**
   * 拖拽结束处理
   */
  handleTouchEnd() {
    if (!this.data.isDragging) return;
    
    this.setData({
      isDragging: false,
      currentIndex: -1,
      offsetY: 0
    });
    
    // 恢复页面滚动
    wx.pageScrollTo({
      scrollTop: this.data.scrollTop,
      duration: 0
    });
    
    // 同步存储
    wx.setStorageSync('todos', this.data.todos);
    getApp().updateCalendarCache(this.data.todos);
  },

  /**
   * 取消拖拽
   */
  cancelDrag() {
    this.setData({
      isDragging: false,
      currentIndex: -1
    });
    
    // 恢复页面滚动
    wx.pageScrollTo({
      scrollTop: this.data.scrollTop,
      duration: 0
    });
  },

  // ===========================
  // 天气信息功能
  // ===========================
  
  /**
   * 加载天气信息
   */
  loadWeather() {
    const that = this;
    let weatherSource = '精确卫星定位'; // 初始化获取方式为定位
    
    // 获取位置权限
    wx.getLocation({
      type: 'wgs84',
      success: (locationRes) => {
        // 成功获取经纬度后发起请求
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
              const weatherData = res.data.results[0];
              
              // 格式化日期
              const rawDate = weatherData.last_update;
              const dateObj = new Date(rawDate);
              const formattedDate = `${dateObj.getFullYear()}年${ 
                (dateObj.getMonth() + 1).toString().padStart(2, '0')}月${
                dateObj.getDate().toString().padStart(2, '0')}日 ${
                dateObj.getHours().toString().padStart(2, '0')}:${
                dateObj.getMinutes().toString().padStart(2, '0')}`;
    
              // 同时更新全局和本地数据
              getApp().globalData.weather = {
                city: weatherData.location.name,
                code: weatherData.now.code,
                text: weatherData.now.text,
                temperature: weatherData.now.temperature,
                last_update: formattedDate,
                source: weatherSource
              };
              
              that.setData({ 
                weather: getApp().globalData.weather,
                isLoading: false
              });
            }
          },
          fail() {
            weatherSource = 'IP 定位';
            getApp().globalData.weather = {
              city: "未知城市",
              code: 0,
              text: "未知天气",
              temperature: "--",
              last_update: formattedDate,
              source: weatherSource
            };

            that.setData({ 
              weather: getApp().globalData.weather,
              isLoading: false
            });
            wx.showToast({ title: '天气获取失败', icon: 'none' });
          }
        });
      },
      fail: (err) => {
        console.error('位置获取失败，使用IP定位', err);
        weatherSource = 'IP 定位';
        
        // 使用IP定位
        wx.request({
          url: 'https://api.seniverse.com/v3/weather/now.json',
          data: {
            key: weatherKey,
            location: 'ip',
            language: 'zh-Hans',
            unit: 'c'
          },
          success(res) {
            if (res.data.results?.[0]?.now) {
              const weatherData = res.data.results[0];
              
              // 格式化日期
              const rawDate = weatherData.last_update;
              const dateObj = new Date(rawDate);
              const formattedDate = `${dateObj.getFullYear()}年${ 
                (dateObj.getMonth() + 1).toString().padStart(2, '0')}月${
                dateObj.getDate().toString().padStart(2, '0')}日 ${
                dateObj.getHours().toString().padStart(2, '0')}:${
                dateObj.getMinutes().toString().padStart(2, '0')}`;
    
              // 同时更新全局和本地数据
              getApp().globalData.weather = {
                city: weatherData.location.name,
                code: weatherData.now.code,
                text: weatherData.now.text,
                temperature: weatherData.now.temperature,
                last_update: formattedDate,
                source: weatherSource
              };
              
              that.setData({ 
                weather: getApp().globalData.weather,
                isLoading: false
              });
            }
          },
          fail() {
            that.setData({ isLoading: false });
            wx.showToast({ title: '天气获取失败', icon: 'none' });
          }
        });
      }
    });
  },

  /**
   * 显示天气详情
   */
  showWeather() {
    const weatherSource = this.data.weather?.source || '未知方式';
    const ipWarning = weatherSource === 'IP 定位' ? '\n\n注意：IP 定位可能不准确，建议开启位置权限以获取更准确的天气信息。' : '';
    
    wx.showModal({
      title: '实时天气信息',
      content: `所在城市：${this.data.weather?.city || '未知'}
天气：${this.data.weather?.text || '未知'}
温度：${this.data.weather?.temperature || '--'}℃
最后更新时间：${this.data.weather?.last_update || '未知'}

由 心知天气 提供实时气象数据
获取方式：${weatherSource}${ipWarning}`,
      showCancel: false,
      confirmText: "知道了"
    });
  },

  // ===========================
  // 权限管理
  // ===========================
  
  /**
   * 检查位置权限
   */
  checkLocationPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 实际调用位置接口触发权限系统记录
              wx.getLocation({
                type: 'wgs84',
                success: () => this.connectBluetooth(),
                fail: () => this.showLocationGuide()
              });
            },
            fail: () => this.showLocationGuide()
          });
        }
      }
    });
  },

  /**
   * 显示位置权限引导
   */
  showLocationGuide() {
    wx.showModal({
      title: '需要位置权限',
      content: '请在系统设置中开启位置权限：\n1. 点击右上角「···」\n2. 进入「设置」\n3. 找到「位置信息」并开启',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (!settingRes.authSetting['scope.userLocation']) {
                this.showSystemSettingGuide();
              }
            }
          });
        }
      }
    });
  },

  /**
   * 显示系统权限引导
   */
  showSystemSettingGuide() {
    const systemInfo = wx.getSystemInfoSync();
    let guideText = '请前往手机设置开启权限：';
    
    if (systemInfo.platform === 'android') {
      guideText += '\n设置 > 应用管理 > 找到本小程序 > 权限管理';
    }

    wx.showModal({
      title: '系统权限指引',
      content: guideText,
      confirmText: '明白了',
      showCancel: false
    });
  },

  /**
   * 获取录音权限
   */
  getRecordAuth() {
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
                  if (res.confirm) wx.openSetting();
                }
              });
            }
          });
        } else {
          console.log("record has been authed");
        }
      }, 
      fail(res) {
        console.log("fail");
        console.log(res);
      }
    });
  },

  /**
   * 用户拒绝授权处理
   */
  userAuthFail(scope, tip) {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '提示',
        content: tip,
        confirmText: '去授权',
        cancelText: '不授权',
        success(res) {
          if (res.confirm) {
            wx.openSetting({
              success: (res) => {
                resolve(res.authSetting[scope]);
              }
            });
          }
          if (res.cancel) {
            reject('您拒绝了授权');
          }
        },
      });
    });
  },

  // ===========================
  // 语音识别功能
  // ===========================
  
  /**
   * 初始化语音识别
   */
  initRecord() {
    const that = this;
    
    // 有新的识别内容返回
    manager.onRecognize = function (res) {
      console.log(res);
      const text = res.result;
      that.setData({
        content: text
      });
      
      if (text === '') {
        wx.showModal({
          title: '语音识别未成功',
          content: `未能识别到有效内容。可能是您在上一轮识别为完成时开启了第二轮识别。
若不是以上情况，请尝试：
1. 长按麦克风按钮保持1秒以上；
2. 在安静环境下清晰说出待办内容；
4. 确认手机麦克风权限已开启。

您也可以直接使用文字输入创建待办`,
          confirmText: '知道了',
          showCancel: false
        });
      }
    };

    // 正常开始录音识别
    manager.onStart = function (res) {
      console.log("成功开始识别", res);
    };

    // 识别错误事件
    manager.onError = function (res) {
      wx.hideLoading();
      console.error("error msg", res);
      wx.showModal({
        title: '识别服务异常',
        content: `未能识别到有效内容，您需要：
1. 长按麦克风按钮保持1秒以上；
2. 在安静环境下清晰说出待办内容；
4. 确认手机麦克风权限已开启。

您也可以直接使用文字输入创建待办`,
        success(res) {
          if (res.confirm) {
            that.getRecordAuth(); // 重新获取授权
          }
        }
      });
    };

    // 识别结束事件
    manager.onStop = function (res) {
      var text = res.result;
  
      // 过滤末尾标点
      if (text && text.length > 0) {
        const lastChar = text[text.length - 1];
        if (['。', '.', '，', ','].includes(lastChar)) {
          text = text.slice(0, -1);
        }
      }

      that.setData({ content: text });
      wx.hideLoading();

      if (text) {
        // 自动跳转添加页面
        wx.navigateTo({
          url: `/pages/add-todo/add-todo?voiceText=${encodeURIComponent(text)}`
        });
      }
    };
  },

  /**
   * 开始录音
   */
  startRecording() {
    this.setData({ recordState: true });
    manager.start({
      lang: 'zh_CN',
    });
    wx.showToast({
      icon: 'none',
      title: '识别已开始，松手结束录音',
    });
  },

  /**
   * 触摸开始录音
   */
  touchStart(e) {
    console.log('start');
    
    // 先检查麦克风权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          // 未授权，先请求权限
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              // 授权成功，开始录音
              this.startRecording();
            },
            fail: () => {
              // 授权失败，显示引导
              wx.showModal({
                title: '需要麦克风权限',
                content: '语音功能需要麦克风权限，请在设置中开启',
                confirmText: '去设置',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          // 已授权，直接开始录音
          this.startRecording();
        }
      },
      fail: () => {
        console.log('获取权限设置失败');
      }
    });
  },

  /**
   * 触摸结束录音
   */
  touchEnd(e) {
    console.log('end');
    this.setData({
      recordState: false
    });
    
    // 结束语音识别
    manager.stop();
    wx.showLoading({
      title: '正在识别...'
    });
  },

  // ===========================
  // 页面交互与导航
  // ===========================
  
  /**
   * 输入框内容变化处理
   */
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /**
   * 手动输入内容
   */
  conInput(e) {
    this.setData({
      content: e.detail.value,
    });
  },

  /**
   * 跳转到待办详情
   */
  navigateToDetail(e) {
    const index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/todo-detail/todo-detail?index=${index}`
    });
  },

  /**
   * 跳转到添加待办页面
   */
  navigateToAdd() {
    wx.navigateTo({
      url: '/pages/add-todo/add-todo'
    });
  },

  /**
   * 显示最新公告
   */
  showLatestNotice() {
    wx.showModal({
      title: this.data.latestNoticeTitle,
      content: this.data.latestNoticeContent.replace(/\n/g, '\n'),
      showCancel: false,
      confirmText: "知道了"
    });
  },

  /**
   * 跳转到公告页面
   */
  navigateToNotice() {
    wx.navigateTo({
      url: '/pages/notice/notice'
    });
  },

  /**
   * 处理滑动操作
   */
  handleSwipeAction(e) {
    const index = parseInt(e.currentTarget.dataset.index); // 确保转换为数字
    const todo = this.data.todos[index];
    
    if (!todo) return;
    
    const actionType = e.currentTarget.dataset.type;
    switch(actionType) {
      case 'delete':
        this.deleteTodo(index);
        break;
      case 'edit':
        this.editTodo(index);
        break;
    }
  },

  /**
   * 监听页面滚动
   */
  onPageScroll(e) {
    const show = e.scrollTop > 500; // 阈值
    if (this.data.showBackTop !== show) {
      this.setData({ showBackTop: show });
    }
  },

  /**
   * 返回顶部
   */
  onToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // ===========================
  // 辅助函数
  // ===========================
  
  /**
   * 格式化日期
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
