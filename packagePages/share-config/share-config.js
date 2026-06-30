const app = getApp();

const EXPIRY_OPTIONS = [
  { label: '1 小时', value: '1h' },
  { label: '6 小时', value: '6h' },
  { label: '24 小时', value: '24h' },
  { label: '3 天', value: '3d' },
  { label: '7 天', value: '7d' },
];

Page({
  data: {
    todo: null,
    subtaskSummary: '',
    tagText: '',
    priorityText: '',
    dateText: '',
    activeTab: 'share',

    // Tab 1: share settings
    settings: {
      expiry: '24h',
      password: '',
      maxViews: '',
      remark: '',
      allowCopy: true,
      trackVisitors: false,
    },
    shareGenerated: false,
    shareId: '',

    // Tab 2: community
    communityPublished: false,

    // Common
    copySuccess: false,
    expiryVisible: false,
    expiryIndex: 1,
    expiryOptions: EXPIRY_OPTIONS,
  },

  onLoad(options) {
    const todoId = options.todoId;
    if (!todoId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.loadTodo(todoId);
  },

  async loadTodo(todoId) {
    const { getLocalTodos } = require('../../utils/sync');
    const localTodos = getLocalTodos();
    let todo = localTodos.find(t => t.id == todoId);

    if (todo) {
      this.renderTodo(todo, localTodos);
    } else {
      try {
        const { todosApi } = require('../../utils/api');
        const res = await todosApi.getById(todoId);
        if (res.success && res.data) {
          this.renderTodo(res.data, []);
        } else {
          wx.showToast({ title: '加载待办失败', icon: 'none' });
        }
      } catch {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    }
  },

  renderTodo(todo, allTodos) {
    // Build subtask summary (first 3 lines)
    const children = allTodos.filter(t => t.parent_id === todo.id && !t.isDeleted);
    const subtaskSummary =
      children
        .slice(0, 3)
        .map(t => '• ' + t.text)
        .join('\n') +
      (children.length > 3 ? '\n...' : '');

    // Priority text
    const priorityMap = {
      0: '无优先级',
      1: '低优先级',
      2: '中优先级',
      3: '高优先级',
    };

    this.setData({
      todo,
      subtaskSummary,
      tagText: todo.tags
        ? Array.isArray(todo.tags)
          ? todo.tags.join(', ')
          : todo.tags
        : '',
      priorityText: priorityMap[todo.priority] || '',
      dateText: todo.dueDate || '',
    });
  },

  // === Tab switching ===

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // === Tab 1: Share settings ===

  onExpiryTap() {
    this.setData({ expiryVisible: true });
  },

  onExpiryConfirm(e) {
    const value = e.detail.value[0];
    const labels = EXPIRY_OPTIONS.map(o => o.value);
    this.setData({
      'settings.expiry': value,
      expiryVisible: false,
      expiryIndex: labels.indexOf(value),
    });
  },

  onExpiryCancel() {
    this.setData({ expiryVisible: false });
  },

  onPasswordChange(e) {
    this.setData({ 'settings.password': e.detail.value });
  },

  onMaxViewsChange(e) {
    this.setData({ 'settings.maxViews': e.detail.value });
  },

  onRemarkChange(e) {
    this.setData({ 'settings.remark': e.detail.value });
  },

  onAllowCopyChange(e) {
    this.setData({ 'settings.allowCopy': e.detail.checked });
  },

  onTrackVisitorsChange(e) {
    this.setData({ 'settings.trackVisitors': e.detail.checked });
  },

  async onGenerateShareCard() {
    const todo = this.data.todo;
    if (!todo || !todo.id) return;

    const { getLocalTodos } = require('../../utils/sync');
    const { shareApi, isLoggedIn, requireLogin } = require('../../utils/api');

    if (!isLoggedIn()) {
      requireLogin(() => {});
      return;
    }

    const allTodos = getLocalTodos();
    const subtasks = {};
    this.collectSubtaskTree(allTodos, todo.id, subtasks);

    wx.showLoading({ title: '生成分享卡片...' });

    try {
      const result = await shareApi.createSnapshot(
        todo,
        subtasks,
        this.data.settings
      );

      if (result.success) {
        const shareId = result.shareId;
        // Persist share ID
        const storedIds = wx.getStorageSync('_sharedSnapshotIds') || {};
        storedIds[todo.id] = shareId;
        wx.setStorageSync('_sharedSnapshotIds', storedIds);

        wx.hideLoading();
        this.setData({ shareGenerated: true, shareId });
      } else {
        wx.hideLoading();
        wx.showToast({ title: '生成失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '生成失败', icon: 'error' });
    }
  },

  collectSubtaskTree(allTodos, rootParentId, result) {
    const children = allTodos.filter(
      t => t.parent_id === rootParentId && !t.isDeleted
    );
    if (children.length === 0) return;

    result[rootParentId] = children.map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      priority: t.priority,
      dueDate: t.dueDate,
      tags: t.tags,
    }));

    children.forEach(c => this.collectSubtaskTree(allTodos, c.id, result));
  },

  onShareAppMessage() {
    const todo = this.data.todo;

    if (
      this.data.activeTab === 'share' &&
      this.data.shareGenerated &&
      this.data.shareId
    ) {
      return {
        title: '分享待办：' + (todo ? todo.text : ''),
        path:
          '/packagePages/todo-detail/todo-detail?isShare=1&shareId=' +
          this.data.shareId,
      };
    }

    return { title: '时光绿径待办' };
  },

  onCopyLink() {
    wx.setClipboardData({
      data: 'https://api.yzjtiantian.cn/share/snapshot/' + this.data.shareId,
      success: () => {
        this.setData({ copySuccess: true });
        setTimeout(() => this.setData({ copySuccess: false }), 2000);
      },
    });
  },

  // === Tab 2: Community ===

  onPublishToCommunity() {
    const todo = this.data.todo;
    if (!todo || !todo.id) return;

    // Check login
    const { isLoggedIn } = require('../../utils/api');
    if (!isLoggedIn()) {
      const { requireLogin } = require('../../utils/api');
      requireLogin(() => {});
      return;
    }

    // Store todo data for post-detail to read
    app.globalData.quickShareTodo = todo;
    wx.navigateTo({
      url: '/packageCommunity/post-detail/post-detail?todoId=' + todo.id,
    });
  },

  onOpenCommunity() {
    wx.switchTab({ url: '/pages/community-home/community-home' });
  },
});
