Page({
  data: {
    // 待办事项内容
    inputValue: '',
    // 日期设置
    setDate: '',
    // 时间设置
    setTime: '',
    // 备注信息
    remarks: '',
    // 位置信息
    location: null,
    // 是否收藏
    isStar: false,
    // 编辑状态标识
    isEdit: false,
    // 编辑索引
    editIndex: -1,

    // 日历相关数据
    showCalendar: false,
    // 最小日期（2025年4月3日）
    minDate: new Date(2025, 3, 3).getTime(),
    // 最大日期（当前年份+5年）
    maxDate: new Date(new Date().getFullYear() + 5, 0, 1).getTime(),
    // 默认选中今天
    value: new Date().getTime(),
    
    // 复用calendar页的format逻辑
    format(day) {
      const { date } = day;
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const cache = getApp().globalData.calendarCache[key];

      if (cache) {
        day.prefix = `${cache.count}项`;
        day.suffix = cache.sampleText.substring(0, 3) + (cache.sampleText.length > 3 ? '..' : '');
        day.className = 't-calendar__day--top';
      }
      
      return day;
    },
  },

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

  /**
   * 页面加载
   */
  onLoad(options) {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '-');
    this.setData({ 
      setDate: today,
      setTime: this.data.setTime || '12:00', // 设置默认时间为12:00
      isStar: false
    });

    // 处理语音输入内容
    if (options.voiceText) {
      this.setData({
        inputValue: decodeURIComponent(options.voiceText),
        isVoiceMode: true // 语音模式标识
      });
    }

    // 处理传入的日期参数
    if (options.setDate) {
      const date = new Date(parseInt(options.setDate));
      this.setData({
        setDate: this.formatDate(date),
        setTime: '12:00'
      });
    }
    
    // 处理编辑模式
    if (options.edit) {
      // 解析位置参数
      const locationParam = options.location;
      let parsedLocation = false;
      
      try {
        parsedLocation = JSON.parse(decodeURIComponent(locationParam));
      } catch (e) {
        console.error('位置参数解析失败:', e);
      }
      
      this.setData({
        inputValue: decodeURIComponent(options.text),
        setDate: options.setDate,
        setTime: options.setTime || '12:00',
        remarks: decodeURIComponent(options.remarks),
        location: parsedLocation,
        isStar: options.isStar === 'true',
        isEdit: true,
        editIndex: options.index
      });
    }
  },

  /**
   * 输入框内容变化处理
   */
  handleInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value
    });
  },

  /**
   * 备注内容变化处理
   */
  handleRemarksChange(e) {
    this.setData({
      remarks: e.detail.value
    });
  },

  /**
   * 日期选择变化处理
   */
  bindDateChange(e) {
    this.setData({
      setDate: e.detail.value
    });
  },

  /**
   * 显示日历
   */
  showCalendar() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ showCalendar: true });
    wx.hideLoading();
  },

  /**
   * 关闭日历
   */
  handleCalendarClose() {
    this.setData({ showCalendar: false });
  },

  /**
   * 日历日期确认选择
   */
  handleCalendarConfirm(e) {
    const selectedDate = this.formatDate(new Date(e.detail.value));
    this.setData({
      setDate: selectedDate
    });
  },
  
  /**
   * 格式化日期为YYYY-MM-DD格式
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 时间选择变化处理
   */
  bindTimeChange(e) {
    this.setData({
      setTime: e.detail.value
    });
  },

  /**
   * 备注输入处理
   */
  onRemarksInput(e) {
    this.setData({
      remarks: e.detail.value
    });
  },

  /**
   * 待办内容输入处理
   */
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  /**
   * 选择位置
   */
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          location: {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      }
    });
  },

  /**
   * 添加/编辑待办事项
   */
  addTodo() {
    const pages = getCurrentPages();
    // 查找上一级页面（todo或calendar页面）
    const prevPage = pages.find(page => 
      page.route === 'pages/todo/todo' || 
      page.route === 'pages/calendar/calendar'
    );
    const app = getApp();
    
    if (this.data.isEdit) {
      // 编辑模式
      const todos = wx.getStorageSync('todos');
      
      // 更新待办事项
      todos[this.data.editIndex] = {
        text: this.data.inputValue,
        setDate: this.data.setDate,
        setTime: this.data.setTime,
        remarks: this.data.remarks,
        completed: todos[this.data.editIndex].completed,
        time: todos[this.data.editIndex].time,
        location: this.data.location,
        isStar: todos[this.data.editIndex].isStar
      };
      
      // 保存到本地存储
      wx.setStorageSync('todos', todos);
      // 更新日历缓存
      app.updateCalendarCache(todos);
      // 更新上一级页面数据
      prevPage.setData({ todos });
      // 返回上一级页面
      wx.navigateBack();
    } else { 
      // 添加模式
      const text = this.data.inputValue.trim();
      const setDate = this.data.setDate;
      
      // 校验必填项
      if (!text || !setDate || !this.data.setTime) {
        wx.showToast({ 
          title: !text ? '请填写事项内容' : !setDate ? '请选择日期' : '请选择时间', 
          icon: 'none' 
        });
        return;
      }
      
      // 使用兼容逻辑添加待办事项
      if (prevPage && prevPage.addTodoFromChild) {
        prevPage.addTodoFromChild(
          text, 
          this.data.setDate,
          this.data.setTime,
          this.data.remarks, 
          this.data.location
        );
      } else {
        // 直接操作本地存储
        const todos = wx.getStorageSync('todos') || [];
        todos.unshift({
          text,
          setDate,
          setTime: this.data.setTime,
          remarks: this.data.remarks,
          location: this.data.location,
          completed: false,
          time: Date.now(),
          isStar: false
        });
        
        // 保存到本地存储
        wx.setStorageSync('todos', todos);
        // 更新日历缓存
        app.updateCalendarCache(todos);
      }
      
      // 返回上一级页面
      wx.navigateBack();
    }
  },
});