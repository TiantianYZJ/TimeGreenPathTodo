Page({
  data: {
    changelogList: []
  },

  onShareAppMessage() {
    return {
      title: '时光绿径待办-更新日志',
      path: '/pages/changelog/changelog',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  onShareTimeline() {
    return {
      title: '时光绿径待办-更新日志',
      path: '/pages/changelog/changelog',
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },
  
  onLoad() {
    const app = getApp()
    this.setData({
      changelogList: app.globalData.changelogList
    })
  },
})