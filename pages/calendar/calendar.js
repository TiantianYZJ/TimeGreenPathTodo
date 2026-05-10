const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { LunarPlugin } = require('@lspriv/wc-plugin-lunar');

WxCalendar.use(LunarPlugin);

Page({
  data: {
    minDate: new Date(2025, 3, 3).getTime(),
    maxDate: new Date(new Date().getFullYear() + 5, 0, 1).getTime(),
    today: new Date().getTime(),
    marks: [], // 初始化marks数组

    format(day) {
      const { date } = day;
      const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
      const cache = getApp().globalData.calendarCache[key];

      if (cache) {
          day.prefix = cache.count;
          day.suffix = cache.sampleText.substring(0,3) + (cache.sampleText.length >3 ? '..' : '');
          day.className = 't-calendar__day--top';
      }
      return day;
    },

    selectedTodos: [],
    selectedDate: '',
  },

  onShareAppMessage() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  onShareTimeline() {
    return {
      title: '时光绿径待办-您的每日任务足迹管家',
      path: '/pages/todo/todo',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  onShow() {
    // 每次页面显示时刷新数据
    this.convertMarks();
    if (this.data.selectedDate) {
      this.searchTodos(this.data.selectedDate);
    }
  },

  handleLoad(e) {
    console.log('日历加载完成', e.detail);
    this.calendar = this.selectComponent('#calendar');
    
    // 转换全局缓存为marks格式
    this.convertMarks();
    
    // 新增初始化选中逻辑
    setTimeout(() => {
      // 获取今日日期对象
      const today = new Date();
      const todayDetail = {
        year: today.getFullYear(),
        month: today.getMonth() + 1, // 月份需要+1
        day: today.getDate()
      };
      
      // 手动触发确认事件
      this.handleConfirm({
        detail: {
          checked: todayDetail
        }
      });
    }, 300);
  },

  // 保持与全局缓存一致的格式化方法
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  convertMarks() {
    const cache = getApp().globalData.calendarCache;
    const marks = [];
    
    for (const key in cache) {
      const date = new Date(key);
      marks.push({
        date: date.getTime(),
        type: 'schedule',
        text: cache[key].sampleText?.split(',')[0]?.trim()
      });
    }
    
    this.setData({ marks });
  },

  // 添加清空选中状态的方法
  clearSelection() {
    this.setData({ 
      selectedTodos: [],
      selectedDate: ''
    });
  },

  parseTime(timeStr) {
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    return hours * 60 + minutes; // 转换为分钟数方便比较
  },

  // 新增搜索方法
  searchTodos(targetDate) {
    const dateObj = new Date(targetDate);
    const currentKey = this.formatDate(dateObj);
    
    const todos = wx.getStorageSync('todos') || [];
    const uniqueTodos = new Map();
    
    const filtered = todos.filter(todo => {
      try {
        const todoDate = new Date(todo.setDate);
        const todoKey = this.formatDate(todoDate);
        const uniqueId = `${todo.text}|${todoKey}|${todo.remarks || ''}`;
        
        if (todoKey === currentKey && !uniqueTodos.has(uniqueId)) {
          uniqueTodos.set(uniqueId, true);
          return true;
        }
        return false;
      } catch (e) {
        console.error('日期解析错误:', todo.setDate);
        return false;
      }
    });

    const sorted = filtered.sort((a, b) => {
      const aTime = this.parseTime(a.setTime || '23:59');
      const bTime = this.parseTime(b.setTime || '23:59');
      return aTime - bTime;
    });

    this.setData({ 
      selectedTodos: sorted,
      selectedDate: currentKey
    });
  },

  // 修改原有的handleConfirm方法
  handleConfirm(e) {
    const { checked } = e.detail;
    const standardDate = new Date(
      checked.year,
      checked.month - 1,
      checked.day
    );
    this.searchTodos(standardDate); // 调用新方法
  },


  // 复用todo页方法
  navigateToDetail(e) {
    const selectedIndex = e.currentTarget.dataset.index;
    // 获取当前展示的待办项
    const currentTodo = this.data.selectedTodos[selectedIndex];
    
    // 在全局todos中查找真实索引
    const todos = wx.getStorageSync('todos');
    const realIndex = todos.findIndex(t => 
        t.text === currentTodo.text && 
        t.setDate === currentTodo.setDate &&
        t.setTime === currentTodo.setTime
    );
    
    wx.navigateTo({
        url: `/pages/todo-detail/todo-detail?index=${realIndex}`
    });
  },

  toggleTodo(e) {
    const index = e.currentTarget.dataset.index;
    const todos = wx.getStorageSync('todos');
    
    // 获取当前展示的待办项
    const currentTodo = this.data.selectedTodos[index];
    
    // 在全局todos中查找真实索引
    const realIndex = todos.findIndex(t => 
      t.text === currentTodo.text && 
      t.setDate === currentTodo.setDate &&
      t.setTime === currentTodo.setTime
    );
    
    if (realIndex !== -1) {
      // 更新真实索引项的完成状态
      todos[realIndex].completed = !todos[realIndex].completed ? Date.now() : false;
      wx.setStorageSync('todos', todos);
      
      // 重新过滤当天待办（保持当前选中日期）
      const filtered = todos.filter(todo => 
        this.formatDate(new Date(todo.setDate)) === this.data.selectedDate
      );
      
      this.setData({ 
        selectedTodos: filtered.sort((a, b) => 
          this.parseTime(a.setTime || '23:59') - this.parseTime(b.setTime || '23:59')
        ) 
      });
      getApp().updateCalendarCache(todos);
    }
  },

  // 复用todo页的删除逻辑（约第171行）
  deleteTodo(index) {
    const that = this
    wx.showModal({
      title: '删除确认',
      content: '该操作不可撤销，确定继续吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          const todos = wx.getStorageSync('todos')
          todos.splice(index, 1)
          wx.setStorageSync('todos', todos)
          that.setData({
            selectedTodos: that.data.selectedTodos.filter((_, i) => i !== index)
          })
          getApp().updateCalendarCache(todos)
        }
      }
    })
  },

  // 复用编辑逻辑（约第184行）
  editTodo(index) {
    const todo = this.data.selectedTodos[index]
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?edit=1&index=${index}&text=${encodeURIComponent(todo.text)}&setDate=${todo.setDate}&setTime=${todo.setTime || '12:00'}&remarks=${encodeURIComponent(todo.remarks || '')}&location=${encodeURIComponent(JSON.stringify(todo.location))}`
    })
  },

  // 复用操作按钮逻辑
  handleSwipeAction(e) {
    const { type, index } = e.currentTarget.dataset;
    if (type === 'edit') {
      this.editTodo(index);
    } else if (type === 'delete') {
      this.deleteTodo(index);
    }
  },

  navigateToAdd() {
    const timestamp = this.data.selectedDate ? new Date(this.data.selectedDate).getTime() : Date.now()
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?setDate=${timestamp}`
    })
  },

  handleBackToToday() {
    const calendar = this.selectComponent('#calendar');
    if (calendar && calendar.checked) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 更新选中日期状态
      this.setData({ 
        selectedDate: todayStr,
        today: today.getTime() // 保持与组件数据同步
      });

      // 调用组件方法跳转
      calendar.checked(today).then(() => {
        this.searchTodos(todayStr); // 刷新当天待办
      });
    }
  },
});