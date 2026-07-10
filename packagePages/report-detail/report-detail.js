const { workReportApi } = require('../../utils/api.js');
const { formatFriendlyDate } = require('../../utils/util.js');

const SECTION_COLORS = ['#00b26a', '#3498db', '#e67e22', '#9b59b6', '#e74c3c', '#1abc9c'];
const app = getApp();

Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    report: null,
    reportType: 'daily',
    sections: [],
    friendlyDate: '',
    sectionColors: SECTION_COLORS,
    canEdit: false,
    canDelete: false,
    loaded: false,
    refreshing: false,
  },

  onLoad(options) {
    const { id } = options;
    if (id) this.loadReport(parseInt(id));
  },

  async loadReport(id) {
    try {
      const result = await workReportApi.getById(id);
      if (result.success && result.data) {
        const report = result.data;
        const sections = report.content?.sections || [];
        const type = report.type || 'daily';
        this.setData({
          report,
          reportType: type,
          sections,
          friendlyDate: formatFriendlyDate(report.periodDate) + (type === 'weekly' && report.periodLabel ? ` · ${report.periodLabel}` : ''),
          canEdit: true,
          canDelete: true,
          loaded: true,
          refreshing: false,
        });
      } else {
        this.setData({ loaded: true, refreshing: false });
      }
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loaded: true, refreshing: false });
    }
  },

  navigateToEdit() {
    if (!this.data.report) return;
    wx.navigateTo({
      url: `/packagePages/report-edit/report-edit?id=${this.data.report.id}`
    });
  },

  deleteReport() {
    wx.showModal({
      title: '删除确认',
      content: '确定删除该报告吗？删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await workReportApi.delete(this.data.report.id);
            wx.showToast({ title: '已删除', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  goBack() { wx.navigateBack(); },
});
