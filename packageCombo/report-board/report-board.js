const { workReportApi, combosApi } = require('../../utils/api.js');
const app = getApp();

Page({
  data: {
    navBarHeight: app.globalData.navBarHeight,
    comboId: 0,
    comboName: '',
    isAdmin: false,
    members: [],
    minDate: new Date(2020, 0, 1).getTime(),
    maxDate: new Date(new Date().getFullYear() + 5, 11, 31).getTime(),
    today: new Date().getTime(),
    marks: [],
    calendarView: 'month',
    currentTab: 'daily',
    activeTabFlag: false,
    selectedDate: '',
    reports: [],
    showFilterPopup: false,
    selectedMemberId: '0',
  },

  onLoad(options) {
    const { combo_id } = options;
    this.setData({ comboId: parseInt(combo_id || 0) });
    this.loadComboInfo();
  },

  async loadComboInfo() {
    try {
      const result = await combosApi.getById(this.data.comboId);
      if (result.success) {
        this.setData({
          comboName: result.combo.name,
          members: result.combo.members || [],
        });
      }
    } catch (err) {
      logger.error('REPORT', 'BOARD_LOAD', '加载组合信息失败', err);
    }
  },

  handleLoad(e) {
    this.calendar = this.selectComponent('#boardCalendar');
    setTimeout(() => {
      const today = new Date();
      const dateStr = this.formatDate(today);
      this.setData({ selectedDate: dateStr });
      this.loadReports();
    }, 300);
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  getMondayOfWeek(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return this.formatDate(d);
  },

  handleDateChange(e) {
    const { checked } = e.detail;
    const d = new Date(checked.year, checked.month - 1, checked.day);
    this.setData({ selectedDate: this.formatDate(d) });
    this.loadReports();
  },

  handleViewChange(e) {
    if (this.data.activeTabFlag) { this.setData({ activeTabFlag: false }); return; }
    const view = e.detail ? (e.detail.value || e.detail) : e;
    if (view === 'month' && this.data.currentTab === 'weekly') this.setData({ currentTab: 'daily' });
    else if (view === 'week' && this.data.currentTab === 'daily') this.setData({ currentTab: 'weekly' });
  },

  onTabChange(e) {
    const tab = e.detail.value;
    this.setData({ currentTab: tab, activeTabFlag: true });
    if (tab === 'daily') {
      this.setData({ calendarView: 'month' });
      if (this.calendar && this.calendar.toggleView) this.calendar.toggleView('month');
    } else {
      this.setData({ calendarView: 'week' });
      if (this.calendar && this.calendar.toggleView) this.calendar.toggleView('week');
    }
    this.loadReports();
  },

  async loadReports() {
    const { comboId, currentTab, selectedDate, selectedMemberId } = this.data;
    if (!selectedDate) return;
    const params = { combo_id: comboId, type: currentTab };
    params.period_date = currentTab === 'daily' ? selectedDate : this.getMondayOfWeek(selectedDate);
    if (selectedMemberId !== '0') params.user_id = parseInt(selectedMemberId);
    try {
      const result = await workReportApi.getBoard(params);
      if (result.success) {
        const reports = (result.data || []).map(item => {
          const sections = item.content?.sections || [];
          const firstLine = sections[0]?.lines?.[0] || '';
          const lineCount = sections.reduce((s, sec) => s + (sec.lines || []).filter(l => l.trim()).length, 0);
          return { ...item, summary: firstLine || '暂无记录', lineCount };
        });
        this.setData({ reports, isAdmin: result.isAdmin });
      }
    } catch (err) { logger.error('REPORT', 'BOARD', '加载看板数据失败', err); }
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/packagePages/report-detail/report-detail?id=${id}` });
  },

  showMemberFilter() { this.setData({ showFilterPopup: true }); },
  hideMemberFilter() { this.setData({ showFilterPopup: false }); },
  onFilterPopupVisibleChange(e) { if (!e.detail.visible) this.setData({ showFilterPopup: false }); },
  onMemberFilterChange(e) { this.setData({ selectedMemberId: e.detail.value, showFilterPopup: false }); this.loadReports(); },

  onFabTap() {
    const { comboId, currentTab, selectedDate } = this.data;
    const date = currentTab === 'daily' ? selectedDate : this.getMondayOfWeek(selectedDate);
    wx.navigateTo({ url: `/packagePages/report-edit/report-edit?type=${currentTab}&date=${date}&combo_id=${comboId}` });
  },

  goBack() { wx.navigateBack(); },
});
