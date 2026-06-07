// 我的交流页面逻辑
const app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: null,
    isLogin: false,
    // 讨论列表数据
    discussionList: [],
    // 加载状态
    loading: false
  },

  // 生命周期函数
  onLoad() {
    console.log('我的交流页面加载');
    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    console.log('我的交流页面显示');
    // 每次页面显示时检查登录状态并刷新数据
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    let userInfo = app.globalData.userInfo;
    
    // 如果全局数据中没有用户信息，尝试从本地存储获取
    if (!userInfo) {
      userInfo = wx.getStorageSync('userInfo');
    }
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLogin: true
      });
      // 加载用户的讨论列表
      this.loadUserDiscussions(userInfo.id);
    } else {
      this.setData({
        isLogin: false,
        discussionList: []
      });
    }
  },

  // 加载用户的讨论列表
  loadUserDiscussions(userId) {
    this.setData({ loading: true });
    
    // 从后端API获取用户的讨论列表
    wx.request({
      url: 'http://localhost:3001/api/discussions/user',
      method: 'GET',
      data: {
        user_id: userId
      },
      success: (res) => {
        console.log('获取用户讨论列表成功:', res.data);
        if (res.data && res.data.data) {
          // 格式化时间
          const formattedDiscussions = res.data.data.map(item => ({
            ...item,
            time: this.formatTime(item.time)
          }));
          this.setData({ discussionList: formattedDiscussions });
        }
      },
      fail: (err) => {
        console.error('获取用户讨论列表失败:', err);
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 跳转到发布讨论页面
  navigateToPost() {
    console.log('点击了+号按钮，准备跳转到发布页面');
    // 存储需要显示发布对话框的标志
    wx.setStorageSync('showPostDialog', true);
    // 跳转到讨论频道页面
    wx.switchTab({
      url: '/pages/find/find',
      success: function(res) {
        console.log('跳转成功:', res);
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({ title: '跳转失败，请重试', icon: 'none' });
      }
    });
  },

  // 跳转到登录页面
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/mine/mine'
    });
  },

  // 查看讨论详情
  viewDiscussion(e) {
    const id = e.currentTarget.dataset.id;
    console.log('查看讨论详情:', id);
    // 跳转到讨论详情页
    wx.navigateTo({
      url: `/pages/discussion-detail/discussion-detail?id=${id}`
    });
  },

  // 点赞讨论
  likeDiscussion(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点赞讨论:', id);
    
    // 显示加载动画
    wx.showLoading({ title: '处理中...' });
    
    // 调用后端API进行点赞
    wx.request({
      url: `http://localhost:3001/api/discussions/${id}/like`,
      method: 'POST',
      success: (res) => {
        if (res.data.success) {
          // 更新本地数据中的点赞数
          const updatedList = this.data.discussionList.map(item => {
            if (item.id === id) {
              return {
                ...item,
                likes: item.likes + 1
              };
            }
            return item;
          });
          this.setData({ discussionList: updatedList });
          wx.showToast({ title: '点赞成功', icon: 'success' });
        } else {
          wx.showToast({ title: '点赞失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('点赞失败:', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        // 隐藏加载动画
        wx.hideLoading();
      }
    });
  },

  // 编辑讨论
  editDiscussion(e) {
    const id = e.currentTarget.dataset.id;
    console.log('编辑讨论:', id);
    
    // 获取当前讨论的数据
    const currentDiscussion = this.data.discussionList.find(item => item.id === id);
    if (!currentDiscussion) {
      wx.showToast({ title: '讨论不存在', icon: 'none' });
      return;
    }
    
    // 跳转到发布页面并传递编辑参数
    wx.navigateTo({
      url: `/pages/find/find?editMode=true&discussionId=${id}&title=${encodeURIComponent(currentDiscussion.title)}&content=${encodeURIComponent(currentDiscussion.content)}&tag=${encodeURIComponent(currentDiscussion.tag)}&image=${encodeURIComponent(currentDiscussion.image || '')}`
    });
  },

  // 删除讨论
  deleteDiscussion(e) {
    const id = e.currentTarget.dataset.id;
    console.log('删除讨论:', id);
    
    // 显示确认对话框
    wx.showModal({
      title: '删除讨论',
      content: '确定要删除这条讨论吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户确认删除讨论');
          
          // 显示加载动画
          wx.showLoading({ title: '处理中...' });
          
          // 调用后端API删除讨论
          wx.request({
            url: `http://localhost:3001/api/discussions/${id}`,
            method: 'DELETE',
            data: {
              user_id: this.data.userInfo.id
            },
            success: (res) => {
              if (res.data.success) {
                // 从本地数据中移除该讨论
                const updatedList = this.data.discussionList.filter(item => item.id !== id);
                this.setData({ discussionList: updatedList });
                wx.showToast({ title: '删除成功', icon: 'success' });
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('删除失败:', err);
              wx.showToast({ title: '网络错误', icon: 'none' });
            },
            complete: () => {
              // 隐藏加载动画
              wx.hideLoading();
            }
          });
        }
      }
    });
  }
});