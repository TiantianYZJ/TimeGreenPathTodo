const { getLocalTodos, saveTodo, getTodoById, deleteTodoById } = require('../../utils/sync.js');
const app = getApp();
const { formatFriendlyDate } = require('../../utils/util.js');

Page({
  data: {
    keywords: [],
    keywordsStr: '',
    searchResults: [],
    scrollTop: 0,
    showBackTop: false,
  },

  // 修改后的搜索提交方法
  onSearchConfirm(e) {
    const value = e.detail.value;
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
    const value = e.detail.value;
    const keywords = value.split(/\s+/).filter(k => k);
    
    this.setData({
      keywords,
      keywordsStr: value
    }, () => {
      this.searchTodos();
    });
  },

  searchTodos() {
    const todos = getLocalTodos();
    const results = todos.filter(todo => !todo.parent_id).filter(todo =>
      this.data.keywords.some(kw =>
        todo.text.toLowerCase().includes(kw.toLowerCase()) ||
        (todo.remarks && todo.remarks.toLowerCase().includes(kw.toLowerCase()))
      )
    ).map(todo => ({
      ...todo,
      friendlyDate: formatFriendlyDate(todo.setDate)
    }));
    
    this.setData({ searchResults: results });
  },

  toggleTodo(e) {
    const todoId = this.data.searchResults[e.currentTarget.dataset.index].id;
    const todo = getTodoById(todoId);

    if (todo) {
      const now = Date.now();
      todo.completed = !todo.completed ? now : false;
      todo.version = (todo.version || 1) + 1;
      todo.updatedAt = now;
      saveTodo(todo);
      app.updateCalendarCache(getLocalTodos());
      this.searchTodos();
    }
  },


  handleSwipeAction(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const actionType = e.currentTarget.dataset.type;
    const todoId = this.data.searchResults[index].id;
    
    switch(actionType) {
      case 'delete':
        this.deleteTodo(todoId);
        break;
      case 'edit':
        this.editTodo(todoId);
        break;
    }
  },

  deleteTodo(todoId) {
    const that = this;
    wx.showModal({
      title: '删除确认',
      content: '删除后保留 30 天，可在"更多-回收站"找回，确定删除吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          deleteTodoById(todoId, Date.now());
          app.updateCalendarCache(getLocalTodos());
          that.searchTodos();
          wx.showToast({ title: "删除成功" });
        }
      }
    });
  },

  editTodo(todoId) {
    const todos = getLocalTodos();
    const todoIndex = todos.findIndex(t => t.id === todoId);
    
    if (todoIndex === -1) return;
    
    const todo = todos[todoIndex];
    const locationStr = todo.location ? encodeURIComponent(JSON.stringify(todo.location)) : '';
    const tagsStr = todo.tags ? encodeURIComponent(JSON.stringify(todo.tags)) : '';
    
    const app = getApp();
    app.globalData.editTodoImages = todo.images || [];
    
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?edit=1&index=${todoIndex}&text=${encodeURIComponent(todo.text)}&setDate=${todo.setDate}&setTime=${todo.setTime || '12:00'}&remarks=${encodeURIComponent(todo.remarks || '')}&location=${locationStr}&time=${todo.time}&isStar=${todo.isStar || false}&tags=${tagsStr}&comboId=${todo.comboId || ''}&hasImages=${(todo.images && todo.images.length > 0) ? '1' : '0'}`
    });
  },

  navigateToDetail(e) {
    if (e.target.dataset.component === 't-radio') {
      return;
    }
    
    const todoId = this.data.searchResults[e.currentTarget.dataset.index].id;
    wx.navigateTo({
      url: `/pages/todo-detail/todo-detail?todoId=${encodeURIComponent(todoId)}`
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