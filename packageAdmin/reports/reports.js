const { communityApi, adminApi } = require('../../utils/api');

Page({
  data: {
    currentTab: 0,
    list: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadList(true);
  },

  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab);
    this.setData({ currentTab: tab, list: [], page: 1, hasMore: true });
    this.loadList(true);
  },

  async loadList(reset = false) {
    if (this.data.loading) return;
    if (!reset && !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const res = await communityApi.getReportList({ status: this.data.currentTab, page: this.data.page });
      if (res.success) {
        const list = res.data.list || [];
        if (reset) {
          this.setData({ list });
        } else {
          this.setData({ list: [...this.data.list, ...list] });
        }
        this.setData({ hasMore: res.data.hasMore, page: this.data.page + 1 });
      }
    } catch (err) {
      console.error('加载举报列表失败', err);
    }

    this.setData({ loading: false });
  },

  loadMore() {
    if (this.data.hasMore) this.loadList(false);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/packageAdmin/report-detail/report-detail?id=${id}` });
  },

  goBack() {
    wx.navigateBack();
  }
});
