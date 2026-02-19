// 个人主页逻辑
const app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLogin: false,
    // 功能模块数据
    modules: {
      travel: [
        {
          id: 1,
          icon: '❤️',
          text: '我的收藏'
        },
        {
          id: 2,
          icon: '📝',
          text: '旅行攻略'
        },
        {
          id: 3,
          icon: '💬',
          text: '我的交流'
        }
      ],
      other: [
        {
          id: 1,
          icon: '⚙️',
          text: '设置'
        },
        {
          id: 2,
          icon: '🛒',
          text: '我的购买'
        },
        {
          id: 3,
          icon: '📞',
          text: '客服中心'
        },
        {
          id: 4,
          icon: 'ℹ️',
          text: '关于我们'
        }
      ]
    },

  },
  
  // 生命周期函数
  onLoad(options) {
    console.log('个人主页 onLoad');
    console.log('onLoad options:', options);
    this.checkLoginStatus();
  },
  
  onShow() {
    console.log('个人主页 onShow');
  },
  
  onReady() {
    console.log('个人主页 onReady');
  },
  
  onHide() {
    console.log('个人主页 onHide - 页面被隐藏了');
  },
  
  onUnload() {
    console.log('个人主页 onUnload - 页面被卸载了');
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
    } else {
      this.setData({
        isLogin: false
      });
    }
  },
  
  // 点击登录
  login() {
    app.login().then(() => {
      this.checkLoginStatus();
    }).catch(err => {
      console.error('登录失败:', err);
    });
  },
  

  
  // 点击功能模块
  clickModule(e) {
    const id = e.currentTarget.dataset.id;
    const text = e.currentTarget.dataset.text;
    console.log('点击模块:', text, id);
    
    // 未登录时提示登录
    if (!this.data.isLogin) {
      this.login();
      return;
    }
    
    // 这里可以跳转到对应页面
    switch(text) {
      case '旅行攻略':
        wx.navigateTo({
          url: '/pages/strategy/strategy'
        });
        break;
      case '我的交流':
        wx.showToast({ title: '我的交流功能开发中', icon: 'none' });
        break;
      case '设置':
        wx.showToast({ title: '设置功能开发中', icon: 'none' });
        break;
      case '我的购买':
        wx.showToast({ title: '我的购买功能开发中', icon: 'none' });
        break;
      case '客服中心':
        wx.showToast({ title: '客服中心功能开发中', icon: 'none' });
        break;
      case '关于我们':
        wx.showToast({ title: '关于我们功能开发中', icon: 'none' });
        break;
      default:
        break;
    }
  },
  
  // 跳转到收藏页面
  navigateToCollection() {
    console.log('跳转到收藏页面');
    
    // 未登录时提示登录
    if (!this.data.isLogin) {
      this.login();
      return;
    }
    
    // 跳转到收藏页面
    wx.navigateTo({
      url: '/pages/collection/collection'
    });
  },
  
  // 点击退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认退出登录');
          app.logout();
          this.checkLoginStatus();
        }
      }
    });
  },
  
  // 选择头像
  chooseAvatar() {
    // 检查登录状态
    if (!this.data.isLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      this.login();
      return;
    }
    
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
  
  // 编辑昵称
  editNickname() {
    wx.showModal({
      title: '修改昵称',
      content: '请输入新的昵称',
      editable: true,
      placeholderText: '请输入昵称',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const newNickname = res.content.trim();
          if (newNickname) {
            this.updateUserInfo({ nickname: newNickname });
          } else {
            wx.showToast({ title: '昵称不能为空', icon: 'none' });
          }
        }
      }
    });
  },
  
  // 编辑城市
  editCity() {
    wx.showModal({
      title: '修改地区',
      content: '请输入新的地区',
      editable: true,
      placeholderText: '请输入地区',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const newCity = res.content.trim();
          if (newCity) {
            this.updateUserInfo({ city: newCity });
          } else {
            wx.showToast({ title: '地区不能为空', icon: 'none' });
          }
        }
      }
    });
  },
  
  // 更新用户信息
  updateUserInfo(updateData) {
    wx.showLoading({ title: '更新中...' });
    
    wx.request({
      url: 'http://localhost:3001/api/users/update',
      method: 'POST',
      data: {
        userId: this.data.userInfo.id,
        ...updateData
      },
      timeout: 10000,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data.success) {
          const updatedUserInfo = res.data.data.userInfo;
          console.log('用户信息更新成功:', updatedUserInfo);
          
          // 更新本地用户信息
          this.setData({ userInfo: updatedUserInfo });
          app.globalData.userInfo = updatedUserInfo;
          
          // 同时更新本地存储
          wx.setStorageSync('userInfo', updatedUserInfo);
          
          wx.showToast({ title: '更新成功', icon: 'success' });
        } else {
          console.error('更新失败，后端返回失败:', res.data);
          wx.showToast({ title: '更新失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('更新用户信息失败:', err);
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  },
  
  // 上传头像
  uploadAvatar(tempFilePath) {
    console.log('开始上传头像，用户ID:', this.data.userInfo.id);
    console.log('上传文件路径:', tempFilePath);
    
    // 检查用户ID是否存在
    if (!this.data.userInfo || !this.data.userInfo.id) {
      console.error('用户ID不存在，重新登录...');
      wx.showLoading({ title: '登录中...' });
      
      app.login().then((userInfo) => {
        wx.hideLoading();
        console.log('重新登录成功，用户ID:', userInfo.id);
        this.setData({ userInfo: userInfo });
        this.uploadAvatar(tempFilePath); // 重新调用上传方法
      }).catch(err => {
        wx.hideLoading();
        console.error('登录失败:', err);
        wx.showToast({ title: '登录失败，请重新尝试', icon: 'none' });
      });
      return;
    }
    
    wx.showLoading({ title: '上传中...' });
    
    // 直接使用wx.request模拟上传，避免小程序的安全限制
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (fileRes) => {
        console.log('读取文件成功，准备发送请求');
        console.log('头像数据长度:', fileRes.data.length);
        
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
            console.log('请求成功，响应:', res);
            
            if (res.statusCode === 200 && res.data.success) {
              console.log('头像上传成功，准备更新用户信息');
              // 更新本地用户信息
              const updatedUserInfo = {
                ...this.data.userInfo,
                avatarUrl: res.data.data.avatarUrl
              };
              console.log('新用户信息:', updatedUserInfo);
              
              this.setData({ userInfo: updatedUserInfo });
              app.globalData.userInfo = updatedUserInfo;
              
              // 同时更新本地存储，确保页面刷新后头像保持最新
              wx.setStorageSync('userInfo', updatedUserInfo);
              
              console.log('用户信息已更新，显示提示');
              wx.showToast({ 
                title: '头像更新成功', 
                icon: 'success',
                duration: 2000
              });
            } else {
              console.error('上传失败，后端返回失败:', res.data);
              wx.showToast({ title: '上传失败', icon: 'none' });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('请求失败:', err);
            wx.showToast({ title: '上传失败，请检查网络连接', icon: 'none' });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('读取文件失败:', err);
        wx.showToast({ title: '读取文件失败', icon: 'none' });
      }
    });
  }
});