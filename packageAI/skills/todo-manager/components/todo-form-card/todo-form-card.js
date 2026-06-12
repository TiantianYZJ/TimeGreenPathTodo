Component({
  lifetimes: {
    created() {
      const modelCtx = wx.modelContext.getContext(this)
      const viewCtx = wx.modelContext.getViewContext(this)
      modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const result = data.result.structuredContent || {}
        this.setData(result)
        const query = []
        if (result.id) query.push(`id=${result.id}`)
        if (result.setDate) query.push(`setDate=${result.setDate}`)
        viewCtx.setRelatedPage({ query: query.join('&') })
      })
    }
  }
})
