const app  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 格式化时间
   */
  formatTime(timeValue) {
    if (!timeValue) return '12:00';
    if (typeof timeValue === 'string' && timeValue.length <= 5) {
      const parts = timeValue.split(':');
      if (parts.length === 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    const timeMatch = String(timeValue).match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '12:00';
  },

  /**
   * 格式化待办日期时间
   */
  formatTodoDate(dateValue) {
    if (!dateValue) return '';
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return '';
    return this.formatDate(dateObj);
  },

  /**
   * 格式化所有待办的日期时间
   */
  formatAllTodos(todos) {
    if (!todos || !Array.isArray(todos)) return todos;
    return todos.map(todo => ({
      ...todo,
      setDate: this.formatTodoDate(todo.setDate),
      setTime: this.formatTime(todo.setTime),
      friendlyDate: formatFriendlyDate(todo.setDate),
      priority: todo.priority || 'p2'
    }));
  },

  // ===========================
  // 广告事件处理
  // ===========================

  /**
   * 广告加载成功
   */
  onAdLoad() {
  },

  /**
   * 广告加载失败
   */
  onAdError(err) {
    logger.error('UI', 'AD', '原生模板广告加载失败', err);
  },

  /**
   * 广告关闭
   */
  onAdClose() {
  },

  /**
   * 广告隐藏
   */
  onAdHide() {
  },

  // ===========================
  // 分享参数处理
  // ===========================

  handleShareParams(options) {
    const { type, code, auto } = options;
    
    if (type === 'combo_invite' && code) {
      const shareData = {
        type: 'combo_invite',
        code: code.toUpperCase().slice(0, 6),
        auto: auto === '1',
        timestamp: Date.now()
      };
      
      wx.setStorageSync('pendingShareData', shareData);
      
      if (!isLoggedIn()) {
        this.setData({ showLoginPopup: true });
      } else {
        this.processComboInvite(shareData.code, shareData.auto);
      }
    }
  },

  handleSceneParams(options) {
    let scene = options.scene;
    if (!scene) return;
    
    try {
      scene = decodeURIComponent(scene);
    } catch (e) {
      logger.error('APP', 'SCENE', '解码scene参数失败', e);
      return;
    }
    
    let code = '';
    let autoJoin = false;
    
    if (scene.includes('=')) {
      const params = {};
      const parts = scene.split('&');
      parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          params[key] = value;
        }
      });
      
      if (params.code) {
        code = params.code.toUpperCase().slice(0, 6);
        autoJoin = params.auto === '1';
      }
    }
    
    if (code.length === 6) {
      const shareData = {
        type: 'combo_invite',
        code: code,
        auto: autoJoin,
        timestamp: Date.now()
      };
      
      wx.setStorageSync('pendingShareData', shareData);
      
      if (!isLoggedIn()) {
        this.setData({ showLoginPopup: true });
      } else {
        this.processComboInvite(shareData.code, shareData.auto);
      }
    }
  },

  checkPendingShareData() {
    const shareData = wx.getStorageSync('pendingShareData');
    
    if (!shareData) return;
    
    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - shareData.timestamp > TEN_MINUTES) {
      wx.removeStorageSync('pendingShareData');
      return;
    }
    
    if (shareData.type === 'combo_invite') {
      if (!isLoggedIn()) {
        this.setData({ showLoginPopup: true });
      } else {
        this.processComboInvite(shareData.code, shareData.auto);
      }
    }
  },

  async processComboInvite(code, autoJoin = false) {
    if (!code || code.length !== 6) {
      wx.showToast({ title: '无效的邀请码', icon: 'none' });
      wx.removeStorageSync('pendingShareData');
      return;
    }

    try {
      const result = await collabApi.join(code);
      const comboInfo = result.combo || result;
      comboInfo.isMember = result.isMember;
      comboInfo.hasPendingRequest = result.hasPendingRequest;
      comboInfo.memberFull = result.memberFull;
      comboInfo.inviteCode = code;
      
      this.setData({
        showInvitePopup: true,
        inviteComboInfo: comboInfo,
        inviteAutoJoin: autoJoin
      });
    } catch (err) {
      wx.showToast({ title: err.message || '获取组合信息失败', icon: 'none' });
      wx.removeStorageSync('pendingShareData');
    }
  },

  hideLoginPopup(e) {
    if (e && e.detail && e.detail.visible === true) {
      return;
    }
    this.setData({ showLoginPopup: false });
    wx.removeStorageSync('pendingShareData');
  },

  goToLogin() {
    this.setData({ showLoginPopup: false });
    wx.navigateTo({ url: '/packagePages/login/login' });
  },

  hideInvitePopup(e) {
    if (e && e.detail && e.detail.visible === true) {
      return;
    }
    this.setData({ showInvitePopup: false, inviteComboInfo: null, inviteAutoJoin: false });
    wx.removeStorageSync('pendingShareData');
  },

  async handleJoinCombo() {
    const { inviteComboInfo, isJoining, inviteAutoJoin } = this.data;
    
    if (isJoining || !inviteComboInfo) return;
    
    if (inviteComboInfo.isMember) {
      wx.navigateTo({
        url: `/packageCombo/combo-detail/combo-detail?id=${inviteComboInfo.id}&shared=1`
      });
      this.hideInvitePopup();
      return;
    }
    
    if (inviteComboInfo.memberFull) {
      wx.showModal({
        title: '成员已满',
        content: '该共享组合成员已满，请联系该组合的超管或管理员。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }
    
    if (inviteComboInfo.hasPendingRequest) {
      wx.showModal({
        title: '提示',
        content: '您已发送过加入申请，请等待超管审批。',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    this.setData({ isJoining: true });

    try {
      const code = inviteComboInfo.inviteCode;
      let result;
      
      if (inviteAutoJoin) {
        result = await collabApi.autoJoin(code);
        
        this.setData({ isJoining: false, showInvitePopup: false });
        wx.removeStorageSync('pendingShareData');
        
        wx.showModal({
          title: '加入成功',
          content: '您已成功加入该共享组合！是否立即进入？\n\n您也可以在"共享组合"标签页找到该组合。',
          confirmText: '立即进入',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              const comboId = result.combo?.id || inviteComboInfo.id;
              wx.navigateTo({
                url: `/packageCombo/combo-detail/combo-detail?id=${comboId}&shared=1`
              });
            }
            this.loadCombosFromCloud();
          }
        });
      } else {
        result = await collabApi.sendRequest(code);
        
        this.setData({ 
          isJoining: false, 
          'inviteComboInfo.hasPendingRequest': true 
        });
        
        wx.showModal({
          title: '申请已发送',
          content: '您的加入申请已发送，请等待超管或管理员审批。',
          showCancel: false,
          confirmText: '我知道了',
          success: () => {
            this.askSubscribeApprovalResult();
          }
        });
      }
    } catch (err) {
      this.setData({ isJoining: false });
      
      if (err.message && err.message.includes('已是该组成员')) {
        wx.showModal({
          title: '提示',
          content: '您已经是该组合的成员，是否立即进入？',
          confirmText: '立即进入',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: `/packageCombo/combo-detail/combo-detail?id=${inviteComboInfo.id}&shared=1`
              });
            }
            this.hideInvitePopup();
          }
        });
      } else if (err.message && err.message.includes('成员已满')) {
        wx.showModal({
          title: '成员已满',
          content: '该共享组合成员已满，请联系该组合的超管或管理员。',
          showCancel: false,
          confirmText: '我知道了'
        });
      } else {
        wx.showToast({ title: err.message || '操作失败', icon: 'none' });
      }
    }
  },

  askSubscribeApprovalResult() {
    const templateId = 'LenG38LPKm6kK4ymXx4Ftoc9LoN2f7xXh7qJ-U-myxA';
    
    wx.showModal({
      title: '订阅审批结果',
      content: '审批通过或拒绝后，您将第一时间收到消息提醒。',
      confirmText: '订阅通知',
      cancelText: '暂不需要',
      success: async (res) => {
        if (res.confirm) {
          try {
            const subscribeRes = await wx.requestSubscribeMessage({
              tmplIds: [templateId]
            });
            
            if (subscribeRes[templateId] === 'accept') {
              const { notifyApi } = require('../../utils/api.js');
              await notifyApi.subscribe([templateId]);
              wx.showToast({ title: '订阅成功', icon: 'success' });
            } else {
              wx.showToast({ title: '已取消订阅', icon: 'none' });
            }
          } catch (err) {
            logger.error('NOTIFY', 'SUBSCRIBE', '订阅失败', err);
            wx.showToast({ title: '订阅失败', icon: 'none' });
          }
        }
      }
    });
  },

  async checkPendingApprovals() {
    if (!isLoggedIn()) return;
    
    const sharedCombos = app.globalData.sharedCombos || [];
    if (sharedCombos.length === 0) return;
    
    const managedCombos = sharedCombos.filter(combo => 
      combo.role === 'owner' || combo.role === 'admin'
    );
    if (managedCombos.length === 0) return;
    
    const approvalGroups = [];
    
    for (const combo of managedCombos) {
      try {
        const result = await collabApi.getRequests(combo.id);
        const requests = result.requests || result || [];
        if (requests.length > 0) {
          const formattedRequests = requests.map(req => ({
            ...req,
            formattedTime: formatDateTime(req.createdAt || req.created_at)
          }));
          approvalGroups.push({
            combo: combo,
            requests: formattedRequests
          });
        }
      } catch (err) {
        logger.error('COLLAB', 'APPROVALS', '获取审批申请失败', err);
      }
    }
    
    if (approvalGroups.length > 0) {
      const totalApprovalCount = approvalGroups.reduce((sum, group) => sum + group.requests.length, 0);
      this.setData({
        showApprovalPopup: true,
        approvalGroups: approvalGroups,
        totalApprovalCount: totalApprovalCount
      });
    }
  },

  hideApprovalPopup(e) {
    if (e && e.detail && e.detail.visible === true) {
      return;
    }
    this.setData({ 
      showApprovalPopup: false, 
      approvalGroups: [],
      totalApprovalCount: 0
    });
  },

  async approveRequest(e) {
    const requestId = e.currentTarget.dataset.id;
    const comboId = e.currentTarget.dataset.comboId;
    const { approvalGroups } = this.data;
    
    const group = approvalGroups.find(g => String(g.combo.id) === String(comboId));
    const request = group?.requests.find(r => r.id === requestId);
    
    this.setData({ approvalLoading: true });
    
    try {
      await collabApi.approveRequest(requestId);
      wx.showToast({ title: '已通过', icon: 'success' });
      
      this.sendApprovalNotification({
        comboName: group?.combo?.name,
        comboId: group?.combo?.id,
        shareCode: group?.combo?.share_code || group?.combo?.shareCode,
        applicantId: request?.userId || request?.user_id,
        requestTime: request?.createdAt || request?.created_at,
        approved: true
      });
      
      const newGroups = approvalGroups.map(group => {
        if (String(group.combo.id) === String(comboId)) {
          return {
            ...group,
            requests: group.requests.filter(r => r.id !== requestId)
          };
        }
        return group;
      }).filter(group => group.requests.length > 0);
      
      if (newGroups.length > 0) {
        const totalApprovalCount = newGroups.reduce((sum, group) => sum + group.requests.length, 0);
        this.setData({ 
          approvalGroups: newGroups,
          totalApprovalCount: totalApprovalCount,
          approvalLoading: false
        });
      } else {
        this.setData({ 
          showApprovalPopup: false,
          approvalGroups: [],
          totalApprovalCount: 0,
          approvalLoading: false
        });
      }
      
      this.loadCombosFromCloud();
    } catch (err) {
      this.setData({ approvalLoading: false });
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  },

  async rejectRequest(e) {
    const requestId = e.currentTarget.dataset.id;
    const comboId = e.currentTarget.dataset.comboId;
    const { approvalGroups } = this.data;
    
    const group = approvalGroups.find(g => String(g.combo.id) === String(comboId));
    const request = group?.requests.find(r => r.id === requestId);
    
    this.setData({ approvalLoading: true });
    
    try {
      await collabApi.rejectRequest(requestId);
      wx.showToast({ title: '已拒绝', icon: 'success' });
      
      this.sendApprovalNotification({
        comboName: group?.combo?.name,
        comboId: group?.combo?.id,
        shareCode: group?.combo?.share_code || group?.combo?.shareCode,
        applicantId: request?.userId || request?.user_id,
        requestTime: request?.createdAt || request?.created_at,
        approved: false
      });
      
      const newGroups = approvalGroups.map(group => {
        if (String(group.combo.id) === String(comboId)) {
          return {
            ...group,
            requests: group.requests.filter(r => r.id !== requestId)
          };
        }
        return group;
      }).filter(group => group.requests.length > 0);
      
      if (newGroups.length > 0) {
        const totalApprovalCount = newGroups.reduce((sum, group) => sum + group.requests.length, 0);
        this.setData({ 
          approvalGroups: newGroups,
          totalApprovalCount: totalApprovalCount,
          approvalLoading: false
        });
      } else {
        this.setData({ 
          showApprovalPopup: false,
          approvalGroups: [],
          totalApprovalCount: 0,
          approvalLoading: false
        });
      }
    } catch (err) {
      this.setData({ approvalLoading: false });
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    }
  },

  async sendApprovalNotification({ comboName, comboId, shareCode, applicantId, requestTime, approved }) {
    if (!applicantId) return;
    
    try {
      const userInfo = app.globalData.userInfo || wx.getStorageSync('user') || {};
      const now = new Date();
      
      const formatTime = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${y}年${m}月${d}日 ${h}:${min}`;
      };
      
      await notifyApi.sendApprovalResult({
        templateId: 'LenG38LPKm6kK4ymXx4Ftoc9LoN2f7xXh7qJ-U-myxA',
        toUserId: applicantId,
        comboId: comboId,
        shareCode: shareCode,
        approved: approved,
        data: {
          thing28: { value: `申请加入「${comboName || '协作组'}」` },
          time52: { value: formatTime(new Date(requestTime)) },
          time26: { value: formatTime(now) },
          phrase1: { value: approved ? '已通过' : '未通过' },
          name2: { value: userInfo.nickname || '管理员' }
        }
      });
    } catch (err) {
      logger.error('NOTIFY', 'APPROVAL', '发送审批通知失败', err);
    }
  }
});
