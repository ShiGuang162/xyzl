// 全局应用逻辑
App({
  onLaunch() {
    // 应用启动时执行
    console.log('乡音智旅小程序启动');
    
    // 可以在这里进行初始化操作，如获取用户信息、检查登录状态等
    this.checkLoginStatus();
  },
  
  onShow() {
    // 应用显示时执行
    console.log('乡音智旅小程序显示');
  },
  
  onHide() {
    // 应用隐藏时执行
    console.log('乡音智旅小程序隐藏');
  },
  
  // 检查登录状态
  checkLoginStatus() {
    console.log('检查登录状态');
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    if (userInfo && token) {
      this.globalData.userInfo = userInfo;
      this.globalData.token = token;
      console.log('用户已登录');
    } else {
      console.log('用户未登录');
    }
  },
  
  // 微信登录
  login() {
    return new Promise((resolve, reject) => {
      wx.showLoading({ title: '登录中...' });
      
      // 步骤1: 调用微信登录接口获取code
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            console.log('获取微信登录code成功:', loginRes.code);
            
            // 步骤2: 获取用户信息
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: (userProfileRes) => {
                console.log('获取用户信息成功:', userProfileRes.userInfo);
                
                // 步骤3: 调用后端登录API
                wx.request({
                  url: 'http://localhost:3001/api/login/wechat',
                  method: 'POST',
                  data: {
                    code: loginRes.code,
                    userInfo: userProfileRes.userInfo
                  },
                  timeout: 10000,
                  success: (apiRes) => {
                    wx.hideLoading();
                    console.log('后端登录API响应:', apiRes.data);
                    
                    if (apiRes.data.success) {
                      const { userInfo, token } = apiRes.data.data;
                      
                      // 存储用户信息和token
                      wx.setStorageSync('userInfo', userInfo);
                      wx.setStorageSync('token', token);
                      
                      // 更新全局数据
                      this.globalData.userInfo = userInfo;
                      this.globalData.token = token;
                      
                      wx.showToast({ title: '登录成功' });
                      resolve(userInfo);
                    } else {
                      wx.showToast({ title: '登录失败', icon: 'none' });
                      reject(apiRes.data.error);
                    }
                  },
                  fail: (apiErr) => {
                    wx.hideLoading();
                    console.error('调用后端登录API失败:', apiErr);
                    wx.showToast({ title: '网络错误，请重试', icon: 'none' });
                    reject(apiErr);
                  }
                });
              },
              fail: (userProfileErr) => {
                wx.hideLoading();
                console.error('获取用户信息失败:', userProfileErr);
                
                // 即使获取用户信息失败，也尝试使用code登录
                wx.request({
                  url: 'http://localhost:3001/api/login/wechat',
                  method: 'POST',
                  data: {
                    code: loginRes.code
                  },
                  timeout: 10000,
                  success: (apiRes) => {
                    if (apiRes.data.success) {
                      const { userInfo, token } = apiRes.data.data;
                      
                      // 存储用户信息和token
                      wx.setStorageSync('userInfo', userInfo);
                      wx.setStorageSync('token', token);
                      
                      // 更新全局数据
                      this.globalData.userInfo = userInfo;
                      this.globalData.token = token;
                      
                      wx.showToast({ title: '登录成功' });
                      resolve(userInfo);
                    } else {
                      wx.showToast({ title: '登录失败', icon: 'none' });
                      reject(apiRes.data.error);
                    }
                  },
                  fail: (apiErr) => {
                    console.error('调用后端登录API失败:', apiErr);
                    wx.showToast({ title: '网络错误，请重试', icon: 'none' });
                    reject(apiErr);
                  }
                });
              }
            });
          } else {
            wx.hideLoading();
            wx.showToast({ title: '登录失败', icon: 'none' });
            reject(loginRes.errMsg);
          }
        },
        fail: (loginErr) => {
          wx.hideLoading();
          wx.showToast({ title: '登录失败', icon: 'none' });
          reject(loginErr);
        }
      });
    });
  },
  
  // 退出登录
  logout() {
    // 清除本地存储
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    
    // 清空全局数据
    this.globalData.userInfo = null;
    this.globalData.token = null;
    
    wx.showToast({ title: '已退出登录' });
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    token: null
  }
});