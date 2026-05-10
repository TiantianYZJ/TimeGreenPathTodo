const app = getApp();

Page({
  data: {
    todo: {},
    remarksHtml: '', // 新增富文本内容字段

    showCalendar: false,
    defaultDate: null,
    currentIndex: -1, // 新增当前索引
    shareButton: {
      openType: 'share'
    },
  },

  onShareAppMessage() {
    const currentTodo = this.data.todo;
    const sharePath = `/pages/todo-detail/todo-detail?isShare=1&text=${encodeURIComponent(currentTodo.text)}&setDate=${currentTodo.setDate}&setTime=${currentTodo.setTime || '12:00'}&remarks=${encodeURIComponent(currentTodo.remarks || '')}&location=${encodeURIComponent(JSON.stringify(currentTodo.location))}&time=${currentTodo.time}`;
    return {
      title: '分享待办：' + currentTodo.text,
      path: sharePath,
      imageUrl: 'https://pic1.imgdb.cn/item/6814180958cb8da5c8d64852.png'
    }
  },

  // 新增添加到待办方法
  addToMyTodos() {
    const newTodo = {
      ...this.data.todo,
      setDate: this.formatDate(new Date()),
      time: Date.now(),
      completed: false
    }
    const todos = [newTodo, ...wx.getStorageSync('todos') || []]
    wx.setStorageSync('todos', todos)
    app.updateCalendarCache(todos);
    wx.showToast({ title: '已添加', icon: 'success' })
    wx.navigateBack()
  },

  onLoad(options) {
    // 默认示例数据
    const defaultTodo = {
      text: '项目需求调研会议',
      setDate: new Date().toISOString().split('T')[0],
      setTime: '12:00',
      remarks: '1. 准备用户画像文档\n2. 确认技术可行性\n3. 制定项目排期',
      location: {
        name: '腾讯大厦会议室',
        address: '深圳市南山区科技园科技中一路',
        latitude: 22.546786,
        longitude: 113.944466
      },
      isStar: true
    };

    // 当没有传入参数时显示示例
    if (!options.index && options.isShare !== '1') {
      const formattedDate = this.formatRichDate(new Date(defaultTodo.setDate));
      this.setData({
        todo: defaultTodo,
        formattedDate,
        isShare: false
      });
      return;
    }

    if(options.isShare === '1') {
      // 被分享方直接使用传入的参数构建todo对象
      const setDate = new Date(options.setDate);
      const formattedDate = this.formatRichDate(setDate);

      // 修复位置参数解析逻辑
      const locationParam = options.location;  // 添加默认值防止undefined
      let parsedLocation = false;
      try {
        parsedLocation = JSON.parse(decodeURIComponent(locationParam));
      } catch (e) {
        console.error('位置参数解析失败:', e);
      }
      console.log(parsedLocation)

      // 被分享方直接使用传入的参数构建todo对象
      this.setData({
        todo: {
          text: decodeURIComponent(options.text),
          setDate: options.setDate, // 保持原始日期字符串
          setTime: options.setTime || '12:00', // 新增时间参数
          remarks: decodeURIComponent(options.remarks || ''),
          location: parsedLocation,
          time: Number(options.time || Date.now()),
          isStar: false // 分享的待办默认不收藏
        },
        formattedDate, // 添加格式化后的日期
        formatDateTime: this.formatDateTime(Number(options.time || Date.now())), // 显示创建时间
        isShare: true
      })
      console.log(options)

    } else {
      // 原有本地访问逻辑
      const index = options.index
      this.setData({ currentIndex: index })
      const todos = wx.getStorageSync('todos') || []
      const todo = todos[index]
      const setDate = new Date(todo.setDate)
      const formattedDate = this.formatRichDate(setDate)
      const formatDateTime = this.formatDateTime(todo.time || Date.now())
      const formatCompletedTime = todo.completed ? this.formatDateTime(todo.completed) : ''

      console.log(todo)
  
      this.setData({ 
        todo,
        formattedDate,
        formatDateTime, // 显示创建时间
        formatCompletedTime, // 显示完成时间
        setTime: todo.setTime || '12:00', // 兼容旧数据
        isShare: false,
        time: todo.time || Date.now(),
        isStar: todo.isStar || false
      })
    }

    if (this.data.todo.remarks) {
      this.setData({
        remarksHtml: this.processRemarks(this.data.todo.remarks)
      })
    }
  },

  // 修改解析方法
  processRemarks(text) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(linkRegex, url => {
      const shortUrl = url.length > 30 ? url.slice(0,30) + '...' : url;
      // 需要添加 href 属性用于捕获点击事件
      return `<a href data-url="${encodeURIComponent(url)}" class="link">${shortUrl}</a>`;
    });
  },

  // 新增点击事件处理
  onRemarksTap(e) {
    const { dataset } = e.detail;
    if (dataset && dataset.url) {
      const decodedUrl = decodeURIComponent(dataset.url);
      wx.showActionSheet({
        itemList: ['复制'],
        success: (res) => {
          switch(res.tapIndex) {
            case 0: // 小程序内访问
              wx.setClipboardData({
                data: decodedUrl,
                success: () => {
                  wx.showToast({
                    title: '链接已复制到剪贴板',
                    icon: 'none'
                  });
                }
              });
              break;
          }
        }
      });
    }
  },

  // 日期格式化方法
  formatRichDate(targetDate) {
    if (!targetDate || !(targetDate instanceof Date)) {
      console.error('无效的日期对象:', targetDate);
      return '日期格式错误';
    }
    
    const time = this.data.todo.setTime || '12:00';
    const [hours, minutes] = time.split(':').map(Number);
    targetDate.setHours(hours, minutes, 0, 0);

    // const now = new Date();
    // const diffMs = targetDate - now;
    // const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // // 获取日期部分(忽略时间)进行比较
    // const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // const isSameDay = targetDay.getTime() === today.getTime();

    // 周几显示
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[targetDate.getDay()];

    // // 相对时间描述
    // let relative = '';
    // if (isSameDay) {
    //   const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    //   const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
    //   if (diffHours !== 0 || diffMinutes !== 0) {
    //     relative = `${Math.abs(diffHours)}小时${Math.abs(diffMinutes)}分${diffMs > 0 ? '后' : '前'}`;
    //   } else {
    //     relative = '现在';
    //   }
    // } else {
    //   relative = `${Math.abs(diffDays)}天${diffDays > 0 ? '后' : '前'}`;
    // }

    return `${this.formatDate(targetDate)} ${time} 周${weekDay}`;
  },

  // 保持原有的 formatDate 方法
  formatDate(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 将时间戳转换为指定格式
  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${weekDay}`;
  },

  // 在 onShow 中更新日期
  onShow() {
    const todos = wx.getStorageSync('todos')
    if (!todos[this.data.currentIndex]) {
      wx.navigateBack()
      return
    }
  
    const todo = todos[this.data.currentIndex]
    const setDate = new Date(todo.setDate)
    
    this.setData({
      todo,
      formattedDate: this.formatRichDate(setDate) // 每次显示都更新
    })
  },

  showCalendar() {
    this.setData({ showCalendar: true })
  },

  onCloseCalendar() {
    this.setData({ showCalendar: false })
  },

  // 新增删除方法
  deleteTodo() {
    const that = this
    wx.showModal({
      title: '删除确认',
      content: '该操作不可撤销，确定继续吗？',
      confirmText: '删除',
      confirmColor: '#ff4d4f',
      success(res) {
        if (res.confirm) {
          const todos = wx.getStorageSync('todos')
          todos.splice(that.data.currentIndex, 1)
          wx.setStorageSync('todos', todos)
          app.updateCalendarCache(todos);
          wx.navigateBack()
          wx.showToast({ title: '删除成功' })
        }
      }
    })
  },

  // 新增编辑方法
  editTodo() {
    const todo = this.data.todo  // 新增这行获取当前待办数据
    wx.navigateTo({
      url: `/pages/add-todo/add-todo?edit=1&text=${encodeURIComponent(todo.text)}&setDate=${todo.setDate}&setTime=${todo.setTime || '12:00'}&remarks=${encodeURIComponent(todo.remarks || '')}&index=${this.data.currentIndex}&location=${encodeURIComponent(JSON.stringify(todo.location))}&time=${todo.time}&isStar=${todo.isStar || false}`
    })
  },
  
  // 在原有代码基础上添加
  onShow() {
    const todos = wx.getStorageSync('todos')
    
    // 处理可能被删除的情况
    if (!todos[this.data.currentIndex]) {
      wx.navigateBack()
      return
    }

    const todo = todos[this.data.currentIndex]
    const setDate = new Date(todo.setDate)
    const today = new Date()
    const timeDiff = setDate.getTime() - today.setHours(0,0,0,0)

    this.setData({
      todo,
      setDate: todo.setDate,
      formattedDate: this.formatRichDate(setDate) // 每次显示都更新
    })
  },

  navigateToLocation() {
    const { latitude, longitude, name } = this.data.todo.location
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: name || '目标位置',
      scale: 18
    })
  },

  copyTitle() {
    wx.setClipboardData({
      data: this.data.todo.text,
      success: () => wx.showToast({ title: '标题已复制' })
    })
  },

  copyDate() {
    // 从原始数据获取标准日期格式
    const stdDate = this.formatDate(new Date(this.data.todo.setDate)) +' '+ this.data.todo.setTime
    wx.setClipboardData({
      data: stdDate,
      success: () => wx.showToast({ title: '时间已复制' })
    })
  },
  
  copyRemarks() {
    wx.setClipboardData({
      data: this.data.todo.remarks || '',
      success: () => wx.showToast({ title: '备注已复制' })
    })
  },

  copyLocation() {
    wx.setClipboardData({
      data: this.data.todo.location.name,
      success: () => wx.showToast({ title: '位置名称已复制' })
    })
  },

  // 新增收藏/取消收藏方法
	toggleStar() {
			const newStarState = !this.data.todo.isStar
			this.setData({
				'todo.isStar': newStarState
			}, () => {
				// 更新存储数据
				const todos = wx.getStorageSync('todos')
				if (this.data.currentIndex > -1) {
					todos[this.data.currentIndex].isStar = newStarState
					wx.setStorageSync('todos', todos)
					getApp().updateCalendarCache(todos)

					// 调用父页面的方法更新待办列表顺序
					const pages = getCurrentPages()
					const prevPage = pages.find(page => page.route === 'pages/todo/todo')
					if (prevPage && prevPage.updateTodoOrder) {
						prevPage.updateTodoOrder()
					}
				}
				wx.showToast({
					title: newStarState ? '已收藏' : '已取消收藏',
					icon: 'none'
				})
			})
		},


  // 订阅消息模板ID（需在微信后台配置）
  tmplIds: ['1jvRWbLBNSasPzKtUnrQEj-7_37zCGRzAwA8aPL_dmQ'], 
  
  // 请求订阅权限
  async requestSubscribePermission() {
    try {
      const { tmplIds } = this;
      const res = await wx.requestSubscribeMessage({ tmplIds })
      if (res.errMsg === 'requestSubscribeMessage:ok') {
        // 保存用户订阅状态
        const grantedTmplIds = Object.entries(res)
          .filter(([k, v]) => tmplIds.includes(k) && v === 'accept')
          .map(([k]) => k)
        
        if (grantedTmplIds.length) {
          await getApp().saveSubscribeStatus(grantedTmplIds)
          return true
        }
      }
      return false
    } catch (e) {
      console.error('订阅失败:', e)
      return false
    }
  },

  // 创建提醒
  async createReminder() {
    // 检查订阅权限
    if (!(await this.requestSubscribePermission())) {
      wx.showToast({ title: '需要通知权限', icon: 'none' })
      return
    }
    
    // 调用云函数发送提醒
    try {
      const { todo } = this.data
      const res = await wx.cloud.callFunction({
        name: 'sendReminder',
        data: {
          todoId: todo._id || todo.id,
          time: todo.setDate + ' ' + (todo.setTime || '12:00'),
          content: todo.text
        }
      })
      
      if (res.result.code === 0) {
        wx.showToast({ title: '提醒设置成功' })
      } else {
        wx.showToast({ title: '设置失败:' + res.result.msg, icon: 'none' })
      }
    } catch (e) {
      console.error('创建提醒失败:', e)
      wx.showToast({ title: '服务异常', icon: 'none' })
    }
  },
})