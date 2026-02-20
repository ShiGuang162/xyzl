// 设置页面逻辑
const app = getApp();

Page({
  data: {
    // 隐私设置
    privacySettings: {
      allowStrangerMessage: true,
      allowComment: true
    },
    // 通知设置
    notificationSettings: {
      system: true,
      comment: true,
      like: true
    },
    // 缓存大小
    cacheSize: '0.0MB'
  },

  // 生命周期函数
  onLoad() {
    console.log('设置页面加载');
    this.calculateCacheSize();
  },

  // 计算缓存大小
  calculateCacheSize() {
    // 模拟缓存大小计算
    this.setData({ cacheSize: '1.2MB' });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 跳转到个人资料页面
  navigateToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({
      url: '/pages/change-password/change-password'
    });
  },

  // 隐私设置变更
  onPrivacySettingChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const newSettings = { ...this.data.privacySettings };
    newSettings[key] = value;
    this.setData({ privacySettings: newSettings });
    // 这里可以保存设置到服务器或本地存储
    wx.setStorageSync('privacySettings', newSettings);
  },

  // 通知设置变更
  onNotificationSettingChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const newSettings = { ...this.data.notificationSettings };
    newSettings[key] = value;
    this.setData({ notificationSettings: newSettings });
    // 这里可以保存设置到服务器或本地存储
    wx.setStorageSync('notificationSettings', newSettings);
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          // 模拟清除缓存
          setTimeout(() => {
            this.setData({ cacheSize: '0.0MB' });
            wx.showToast({ title: '缓存清除成功', icon: 'success' });
          }, 1000);
        }
      }
    });
  },

  // 跳转到关于我们页面
  navigateToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '乡音智旅 v1.0.0\n\n致力于为用户提供优质的旅游攻略和交流平台\n\n© 2026 乡音智旅',
      showCancel: false
    });
  },

  // 检查更新
  checkUpdate() {
    wx.showToast({
      title: '当前已是最新版本',
      icon: 'success'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          // 跳转到登录页面
          wx.navigateTo({
            url: '/pages/mine/mine'
          });
        }
      }
    });
  }
});