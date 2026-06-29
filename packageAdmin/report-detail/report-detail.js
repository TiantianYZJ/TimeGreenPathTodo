const { communityApi } = require('../../utils/api');

Page({
  data: {
    reportId: null,
    report: {},
    resultNote: '',
    processing: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ reportId: parseInt(options.id) });
      this.loadDetail();
    }
  },

  async loadDetail() {
    try {
      const res = await communityApi.getReportDetail(this.data.reportId);
      if (res.success) {
        this.setData({ report: res.data });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onNoteInput(e) {
    this.setData({ resultNote: e.detail.value });
  },

  async processReport(e) {
    const action = e.currentTarget.dataset.action;
    const actionText = action === 'delete' ? '删除内容并标记为已处理' : '驳回举报';

    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}吗？`,
      success: async (res) => {
        if (res.confirm) {
          this.setData({ processing: true });
          try {
            await communityApi.processReport(this.data.reportId, {
              action,
              resultNote: this.data.resultNote || null
            });
            wx.showToast({ title: '处理成功', icon: 'success' });
            this.loadDetail();
          } catch (err) {
            wx.showToast({ title: err.message || '处理失败', icon: 'none' });
          }
          this.setData({ processing: false });
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
