const app = getApp();

Page({
  data: {
    keywords: [],
    keywordsStr: '', // 用于显示的空格分隔关键词
    searchResults: [],
    currentSwipeIndex: null, // 滑动操作索引

    scrollTop: 0,
    showBackTop: false, // 新增显示控制
  },

  onLoad(options) {
    const keywords = decodeURIComponent(options.keywords || '').split(',');
    this.setData({
      keywords,
      keywordsStr: keywords.join(' ') // 将逗号转换为空格显示
    }, this.searchTodos);
  },

  onShow() {
    // 当返回页面时刷新数据
    this.searchTodos();
  },

  // 修改后的搜索提交方法
  onSearchConfirm(e) {
    const value = e.detail.value.trim();
    const keywords = value.split(/\s+/).filter(k => k);
    
    if (keywords.length === 0) return;
    
    this.setData({
      keywords,
      keywordsStr: value
    }, () => {
      this.searchTodos();
      // 更新页面URL参数
      wx.redirectTo({
        url: `/pages/todo-search/todo-search?keywords=${encodeURIComponent(keywords.join(','))}`
      });
    });
  },

  onSearchInput(e) {
    this.setData({
      keywordsStr: e.detail.value
    });
  },

  searchTodos() {
    const todos = wx.getStorageSync('todos') || [];
    const results = todos
      .map((todo, originalIndex) => ({ ...todo, originalIndex })) // 保留原始索引
      .filter(todo => 
        this.data.keywords.some(kw =>
          todo.text.toLowerCase().includes(kw.toLowerCase()) ||
          (todo.remarks && todo.remarks.toLowerCase().includes(kw.toLowerCase()))
        )
      );
    
    this.setData({ searchResults: results });
  },

  // 新增切换完成状态方法
  toggleTodo(e) {
    const originalIndex = this.data.searchResults[e.currentTarget.dataset.index].originalIndex;
    const todos = wx.getStorageSync('todos');
    todos[originalIndex].completed = !todos[originalIndex].completed;
    
    wx.setStorageSync('todos', todos);
    app.updateCalendarCache(todos);
    this.searchTodos(); // 刷新搜索结果
  },


  // 复用滑动操作逻辑
  handleSwipeAction(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const actionType = e.currentTarget.dataset.type;
    const originalIndex = this.data.searchResults[index].originalIndex;
    
    switch(actionType) {
      case 'delete':
        this.deleteTodo(originalIndex);
        break;
      case 'edit':
        this.editTodo(originalIndex);
        break;
    }
  },

  // 复用删除逻辑
  deleteTodo(originalIndex) {
    const that = this;
    wx.showModal({
      title: '删除确认',
      content: '该操作不可撤销，确定继续吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          const todos = wx.getStorageSync('todos');
          todos.splice(originalIndex, 1);
          wx.setStorageSync('todos', todos);
          app.updateCalendarCache(todos);
          that.searchTodos(); // 刷新搜索结果
          wx.showToast({ title: '删除成功' });
        }
      }
    });
  },

  // 复用编辑逻辑
  editTodo(originalIndex) {
    const todo = wx.getStorageSync('todos')[originalIndex];
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?edit=1&index=${originalIndex}&text=${encodeURIComponent(todo.text)}&setDate=${todo.setDate}&setTime=${todo.setTime || '12:00'}&remarks=${encodeURIComponent(todo.remarks || '')}&location=${encodeURIComponent(JSON.stringify(todo.location))}`
    });
  },

  // 保持原有详情跳转
  navigateToDetail(e) {
    const originalIndex = this.data.searchResults[e.currentTarget.dataset.index].originalIndex;
    wx.navigateTo({
      url: `/pages/todo-detail/todo-detail?index=${originalIndex}`
    });
  },

  // 监听页面滚动
  onPageScroll(e) {
    const show = e.scrollTop > 500; // 200rpx阈值
    if (this.data.showBackTop !== show) {
      this.setData({ showBackTop: show });
    }
  },

  // 返回顶部方法
  onToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },
});