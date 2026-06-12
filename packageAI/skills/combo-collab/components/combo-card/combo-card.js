Component({
  lifetimes: {
    created() {
      const modelCtx = wx.modelContext.getContext(this)
      const viewCtx = wx.modelContext.getViewContext(this)
      modelCtx.on(wx.modelContext.NotificationType.Result, (data) => {
        const result = data.result.structuredContent || {}
        this.setData(result)
        if (result.combos && result.combos.length > 0) {
          viewCtx.setRelatedPage({ query: `id=${result.combos[0].id}` })
        }
      })
    }
  }
})
