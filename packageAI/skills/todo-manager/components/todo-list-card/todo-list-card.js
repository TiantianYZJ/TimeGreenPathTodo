Component({
  lifetimes: {
    created() {
      const modelCtx = wx.modelContext.getContext(this)
      const viewCtx = wx.modelContext.getViewContext(this)
      modelCtx.on(wx.modelContext.NotificationType.Input, (data) => {
        const input = data.input || {}
        const query = []
        if (input.date) query.push(`date=${input.date}`)
        if (input.tagId) query.push(`tagId=${input.tagId}`)
        if (input.keyword) query.push(`keyword=${encodeURIComponent(input.keyword)}`)
        viewCtx.setRelatedPage({ query: query.join('&') })
      })
      modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        this.setData(data.result.structuredContent || {})
      })
    }
  }
})
