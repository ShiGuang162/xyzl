// 个人资料编辑页面逻辑
const app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {
      nickname: '',
      avatarUrl: '',
      city: '',
      gender: 0
    },
    // 性别选项
    genderOptions: ['未知', '男', '女'],
    genderIndex: 0,
    // 保存状态
    saving: false
  },

  // 生命周期函数
  onLoad() {
    console.log('个人资料编辑页面加载');
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    let userInfo = app.globalData.userInfo;
    
    // 如果全局数据中没有用户信息，尝试从本地存储获取
    if (!userInfo) {
      userInfo = wx.getStorageSync('userInfo');
    }
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        genderIndex: userInfo.gender || 0
      });
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.uploadAvatar(tempFilePaths[0]);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },

  // 上传头像
  uploadAvatar(tempFilePath) {
    wx.showLoading({ title: '上传中...' });
    
    // 直接使用wx.request模拟上传，避免小程序的安全限制
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (fileRes) => {
        wx.request({
          url: 'http://localhost:3001/api/upload/avatar-base64',
          method: 'POST',
          data: {
            userId: this.data.userInfo.id,
            avatarData: fileRes.data,
            fileName: tempFilePath.split('/').pop()
          },
          timeout: 30000,
          success: (res) => {
            wx.hideLoading();
            
            if (res.statusCode === 200 && res.data.success) {
              // 更新本地用户信息
              const updatedUserInfo = {
                ...this.data.userInfo,
                avatarUrl: res.data.data.avatarUrl
              };
              
              this.setData({ userInfo: updatedUserInfo });
              wx.showToast({ title: '头像更新成功', icon: 'success' });
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('上传头像失败:', err);
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('读取文件失败:', err);
        wx.showToast({ title: '读取文件失败', icon: 'none' });
      }
    });
  },

  // 昵称变更
  onNicknameChange(e) {
    const nickname = e.detail.value;
    this.setData({
      'userInfo.nickname': nickname
    });
  },

  // 地区变更
  onCityChange(e) {
    const city = e.detail.value;
    this.setData({
      'userInfo.city': city
    });
  },

  // 性别变更
  onGenderChange(e) {
    const genderIndex = e.detail.value;
    this.setData({
      genderIndex: genderIndex,
      'userInfo.gender': genderIndex
    });
  },

  // 保存个人资料
  saveProfile() {
    if (this.data.saving) return;
    
    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...' });
    
    // 调用后端API更新用户信息
    wx.request({
      url: 'http://localhost:3001/api/users/update',
      method: 'POST',
      data: {
        userId: this.data.userInfo.id,
        nickname: this.data.userInfo.nickname,
        city: this.data.userInfo.city
      },
      timeout: 10000,
      success: (res) => {
        wx.hideLoading();
        this.setData({ saving: false });
        
        if (res.statusCode === 200 && res.data.success) {
          const updatedUserInfo = res.data.data.userInfo;
          
          // 更新本地用户信息
          this.setData({ userInfo: updatedUserInfo });
          app.globalData.userInfo = updatedUserInfo;
          wx.setStorageSync('userInfo', updatedUserInfo);
          
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            this.navigateBack();
          }, 1000);
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ saving: false });
        console.error('保存个人资料失败:', err);
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  }
});