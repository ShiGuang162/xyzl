// 关于我们页面逻辑
Page({
  data: {
    // 版本号
    version: '1.0.0'
  },

  // 生命周期函数
  onLoad() {
    console.log('关于我们页面加载');
    // 获取小程序版本信息
    this.getVersionInfo();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 获取版本信息
  getVersionInfo() {
    // 获取小程序版本
    const accountInfo = wx.getAccountInfoSync();
    if (accountInfo && accountInfo.miniProgram) {
      this.setData({
        version: accountInfo.miniProgram.version || '1.0.0'
      });
    }
  },

  // 复制邮箱
  copyEmail() {
    const email = 'contact@xiangyinzlv.com';
    wx.setClipboardData({
      data: email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  // 复制电话
  copyPhone() {
    const phone = '400-888-8888';
    wx.setClipboardData({
      data: phone,
      success: () => {
        wx.showToast({
          title: '电话已复制',
          icon: 'success'
        });
      }
    });
  }
});