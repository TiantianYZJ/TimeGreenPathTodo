Component({
  lifetimes: {
    created() {
      const modelCtx = wx.modelContext.getContext(this)
      const viewCtx = wx.modelContext.getViewContext(this)
      modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const result = data.result.structuredContent || {}
        this.setData(result)
        if (result.year && result.month) {
          viewCtx.setRelatedPage({ query: `year=${result.year}&month=${result.month}` })
        }
      })
    }
  }
})
