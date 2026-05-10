import CryptoJS from 'crypto-js';

// 自定义生成随机 WordArray 的函数
function getRandomWordArray(length) {
  const array = new Uint8Array(length);
  wx.getRandomValues(array);
  return CryptoJS.lib.WordArray.create(array);
}

Page({
  data: {
    // 添加 AES 加密选项
    methods: ['DES 加密', 'AES 加密'], 
    methodIndex: 0,
    originalText: '',
    resultText: '',
    message: '',
    messageType: '',
    secretKey: ''
  },

  bindMethodChange(e) {
    this.setData({
      methodIndex: e.detail.value
    });
  },

  onOriginalTextInput(e) {
    this.setData({
      originalText: e.detail.value
    });
  },

  // 新增密钥输入处理方法
  onSecretKeyInput(e) {
    this.setData({
      secretKey: e.detail.value
    });
  },

  copySecretKey() {
    wx.setClipboardData({
      data: this.data.secretKey
    });
  },

  generateSecretKey() {
    wx.vibrateShort({ type: 'medium' }) // 添加短震动反馈
    
    const method = this.data.methods[this.data.methodIndex];
    let keyLength;
    if (method === 'DES 加密') {
      keyLength = 8;
    } else if (method === 'AES 加密') {
      // 随机选择 16、24 或 32 位作为 AES 密钥长度
      const keyLengths = [16, 24, 32];
      keyLength = keyLengths[Math.floor(Math.random() * keyLengths.length)];
    }

    // 生成随机密钥
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretKey = '';
    for (let i = 0; i < keyLength; i++) {
      secretKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // 更新密钥数据
    this.setData({
      secretKey
    });
  },

  

  encryptText() {
    if (!this.data.originalText) {
      this.showMessage('请输入要加密的文本', 'error');
      return;
    }
    const method = this.data.methods[this.data.methodIndex];
    let key;
    if (method === 'DES 加密') {
      if (this.data.secretKey.length !== 8) {
        this.showMessage('DES 密钥长度必须为 8 位', 'error');
        return;
      }
      key = CryptoJS.enc.Utf8.parse(this.data.secretKey);
    } else if (method === 'AES 加密') {
      // AES 密钥长度支持 16, 24, 32 字节，对应 128, 192, 256 位
      const validKeyLengths = [16, 24, 32];
      if (!validKeyLengths.includes(this.data.secretKey.length)) {
        this.showMessage('AES 密钥长度必须为 16、24 或 32 位', 'error');
        return;
      }
      key = CryptoJS.enc.Utf8.parse(this.data.secretKey);
    }

    let result;
    try {
      if (method === 'DES 加密') {
        // 将密钥转换为 WordArray 类型
        const key = CryptoJS.enc.Utf8.parse(this.data.secretKey); 
        result = this.desEncrypt(this.data.originalText, key);
      } else if (method === 'AES 加密') {
        // 生成随机 IV
        const iv = getRandomWordArray(16); 
        result = this.aesEncrypt(this.data.originalText, key, iv);
        // 将 IV 拼接到密文前面
        result = iv.toString() + ':' + result; 
      }
      this.setData({ resultText: result });
      wx.vibrateShort({ type: 'medium' }) // 添加短震动反馈
      this.showMessage('加密成功', 'success');
    } catch (error) {
      console.error('加密错误:', error); 
      wx.vibrateShort({ type: 'danger' }) // 添加震动反馈
      this.showMessage('加密失败', 'error');
    }
  },

  decryptText() {
    if (!this.data.originalText) {
      this.showMessage('请输入要解密的文本', 'error');
      return;
    }
    const method = this.data.methods[this.data.methodIndex];
    let key;
    if (method === 'DES 加密') {
      if (this.data.secretKey.length !== 8) {
        this.showMessage('DES 密钥长度必须为 8 位', 'error');
        return;
      }
      key = CryptoJS.enc.Utf8.parse(this.data.secretKey);
    } else if (method === 'AES 加密') {
      const validKeyLengths = [16, 24, 32];
      if (!validKeyLengths.includes(this.data.secretKey.length)) {
        this.showMessage('AES 密钥长度必须为 16、24 或 32 位', 'error');
        return;
      }
      key = CryptoJS.enc.Utf8.parse(this.data.secretKey);
    }

    let result;
    try {
      if (method === 'DES 加密') {
        // 将密钥转换为 WordArray 类型
        const key = CryptoJS.enc.Utf8.parse(this.data.secretKey); 
        result = this.desDecrypt(this.data.originalText, key);
      } else if (method === 'AES 加密') {
        // 从密文中分离 IV 和密文
        const [ivHex, ciphertext] = this.data.originalText.split(':');
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        result = this.aesDecrypt(ciphertext, key, iv);
      }
      if (result) {
        this.setData({ resultText: result });
        wx.vibrateShort({ type: 'medium' }) // 添加短震动反馈
        this.showMessage('解密成功', 'success');
      } else {
        this.showMessage('解密结果为空', 'warning');
      }
    } catch (error) {
      console.error('解密错误:', error); 
      wx.vibrateShort({ type: 'danger' }) // 添加震动反馈
      this.showMessage('解密失败，可能输入内容格式不正确', 'error');
    }
  },

  // DES 加密
  desEncrypt(text, key) {
    const encrypted = CryptoJS.DES.encrypt(text, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },

  // DES 解密
  desDecrypt(ciphertext, key) {
    const decrypted = CryptoJS.DES.decrypt(ciphertext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  },

  // AES 加密函数
  aesEncrypt(text, key, iv) {
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  },

  // AES 解密函数
  aesDecrypt(ciphertext, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  },

  shareText() {
    wx.setClipboardData({
      data: this.data.resultText,
      success: () => {
        wx.vibrateShort({ type: 'medium' }) // 添加短震动反馈
        this.showMessage('文本已复制到剪贴板，可进行分享', 'success');
      },
      fail: () => {
        wx.vibrateShort({ type: 'danger' }) // 添加震动反馈
        this.showMessage('复制失败，请重试', 'error');
      }
    });
  },

  showMessage(content, type) {
    this.setData({
      message: content,
      messageType: type
    });
    setTimeout(() => {
      this.setData({
        message: '',
        messageType: ''
      });
    }, 2000);
  }
});