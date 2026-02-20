// 讨论页 - QQ频道风格逻辑
const app = getApp();

Page({
  data: {
    // 当前选中的分类
    activeCategory: 'all',
    // 分类标题映射
    categoryTitles: {
      all: '全部讨论',
      strategy: '旅游攻略',
      food: '美食推荐',
      scenic: '景点讨论',
      transport: '交通住宿',
      story: '旅行故事',
      other: '其他话题' 
    },
    // 讨论列表数据
    discussionList: [],
    // 加载状态
    loading: false,
    // 搜索相关
    showSearchDialog: false,
    searchKeyword: '',
    searchHistory: [],
    hotSearchList: ['北京', '成都', '西湖', '上海', '西藏', '旅游攻略', '美食推荐'],
    searchResults: [],
    searching: false,
    // 发布讨论相关
    showPostDialog: false,
    postTitle: '',
    postContent: '',
    selectedCategory: 'strategy',
    postCategories: [
      { id: 'strategy', name: '旅游攻略' },
      { id: 'food', name: '美食推荐' },
      { id: 'scenic', name: '景点讨论' },
      { id: 'transport', name: '交通住宿' },
      { id: 'story', name: '旅行故事' },
      { id: 'other', name: '其他话题' }
    ],
    postImage: '',
    submitting: false
  },

  // 生命周期函数
  onLoad(options) {
    console.log('讨论页加载', options);
    // 检查是否需要显示发布对话框
    if (options && options.showPostDialog === 'true') {
      this.setData({ showPostDialog: true });
    }
    // 初始加载数据
    this.loadData();
  },
  
  // 页面显示时
  onShow() {
    console.log('讨论页显示');
    // 检查是否需要显示发布对话框
    const showPostDialog = wx.getStorageSync('showPostDialog');
    if (showPostDialog) {
      this.setData({ showPostDialog: true });
      // 清除本地存储，避免下次进入页面时重复显示
      wx.removeStorageSync('showPostDialog');
    }
  },

  // 加载数据
  loadData() {
    this.setData({ loading: true });
    
    // 从后端API获取讨论列表
    wx.request({
      url: 'http://localhost:3001/api/discussions',
      method: 'GET',
      success: (res) => {
        console.log('获取讨论列表成功:', res.data);
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
        console.error('获取讨论列表失败:', err);
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    console.log('切换分类:', category);
    
    this.setData({ 
      activeCategory: category,
      loading: true 
    });
    
    // 从后端API获取对应分类的讨论列表
    wx.request({
      url: 'http://localhost:3001/api/discussions',
      method: 'GET',
      data: {
        category: category
      },
      success: (res) => {
        console.log('获取分类讨论列表成功:', res.data);
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
        console.error('获取分类讨论列表失败:', err);
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

  // 显示搜索对话框
  showSearchDialog() {
    console.log('显示搜索对话框');
    // 从本地存储加载搜索历史
    const searchHistory = wx.getStorageSync('searchHistory') || [];
    this.setData({
      showSearchDialog: true,
      searchKeyword: '',
      searchHistory: searchHistory,
      searchResults: [],
      searching: false
    });
  },
  
  // 隐藏搜索对话框
  hideSearchDialog() {
    console.log('隐藏搜索对话框');
    this.setData({
      showSearchDialog: false,
      searchKeyword: '',
      searchResults: []
    });
  },
  
  // 搜索输入变化
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
  },
  
  // 清空搜索输入
  clearSearchInput() {
    this.setData({ searchKeyword: '' });
  },
  
  // 搜索确认
  onSearchConfirm() {
    const keyword = this.data.searchKeyword.trim();
    if (keyword) {
      this.performSearch(keyword);
    }
  },
  
  // 执行搜索
  performSearch(keyword) {
    console.log('执行搜索:', keyword);
    
    this.setData({ searching: true });
    
    // 模拟搜索延迟
    setTimeout(() => {
      // 从讨论列表中过滤匹配的内容
      const results = this.data.discussionList.filter(item => {
        return (
          item.title.includes(keyword) ||
          item.content.includes(keyword) ||
          item.tag.includes(keyword)
        );
      });
      
      this.setData({ 
        searchResults: results,
        searching: false 
      });
      
      // 保存搜索历史
      this.saveSearchHistory(keyword);
    }, 500);
  },
  
  // 保存搜索历史
  saveSearchHistory(keyword) {
    let history = this.data.searchHistory;
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到历史记录开头
    history.unshift(keyword);
    
    // 限制历史记录数量
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    // 保存到本地存储
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },
  
  // 清空搜索历史
  clearSearchHistory() {
    wx.removeStorageSync('searchHistory');
    this.setData({ searchHistory: [] });
  },
  
  // 点击搜索历史项
  onHistoryItemClick(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.performSearch(keyword);
  },
  
  // 点击热门搜索项
  onHotSearchClick(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.performSearch(keyword);
  },

  // 显示排序对话框
  showSortDialog() {
    console.log('显示排序对话框');
    // 这里可以实现排序功能
    wx.showToast({ title: '排序功能开发中', icon: 'none' });
  },

  // 显示发布讨论对话框
  showPostDialog() {
    console.log('显示发布讨论对话框');
    this.setData({
      showPostDialog: true,
      postTitle: '',
      postContent: '',
      selectedCategory: 'strategy',
      postImage: ''
    });
  },
  
  // 隐藏发布讨论对话框
  hidePostDialog() {
    console.log('隐藏发布讨论对话框');
    this.setData({
      showPostDialog: false,
      postTitle: '',
      postContent: '',
      selectedCategory: 'strategy',
      postImage: '',
      submitting: false
    });
  },
  
  // 发布标题输入
  onPostTitleInput(e) {
    const title = e.detail.value;
    this.setData({ postTitle: title });
  },
  
  // 发布内容输入
  onPostContentInput(e) {
    const content = e.detail.value;
    this.setData({ postContent: content });
  },
  
  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
  },
  
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({ postImage: tempFilePaths[0] });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },
  
  // 删除图片
  removeImage() {
    this.setData({ postImage: '' });
  },
  
  // 提交发布
  submitPost() {
    const { postTitle, postContent, selectedCategory, postImage } = this.data;
    
    // 验证输入
    if (!postTitle.trim()) {
      wx.showToast({ title: '请输入讨论标题', icon: 'none' });
      return;
    }
    
    if (!postContent.trim()) {
      wx.showToast({ title: '请输入讨论内容', icon: 'none' });
      return;
    }
    
    // 获取用户信息
    let userInfo = app.globalData.userInfo;
    
    // 如果全局数据中没有用户信息，尝试从本地存储获取
    if (!userInfo) {
      userInfo = wx.getStorageSync('userInfo');
    }
    
    // 如果用户未登录，提示登录
    if (!userInfo) {
      wx.showModal({
        title: '请先登录',
        content: '发布讨论需要登录账号',
        success: (res) => {
          if (res.confirm) {
            // 跳转到个人主页登录
            wx.navigateTo({
              url: '/pages/mine/mine'
            });
          }
        }
      });
      return;
    }
    
    this.setData({ submitting: true });
    
    // 分类映射
    const categoryMap = {
      'strategy': '旅游攻略',
      'food': '美食推荐',
      'scenic': '景点讨论',
      'transport': '交通住宿',
      'story': '旅行故事',
      'other': '其他话题'
    };
    
    const tag = categoryMap[selectedCategory];
    
    // 准备发布数据
    const postData = {
      title: postTitle,
      content: postContent,
      tag: tag,
      user_id: userInfo.id,
      user_name: userInfo.nickname,
      user_avatar: userInfo.avatarUrl ? userInfo.avatarUrl.charAt(0) : '用', // 使用头像URL的第一个字符作为默认头像
      image: postImage
    };
    
    // 调用后端API发布讨论
    wx.request({
      url: 'http://localhost:3001/api/discussions',
      method: 'POST',
      data: postData,
      success: (res) => {
        console.log('发布讨论成功:', res.data);
        if (res.data && res.data.success) {
          wx.showToast({ title: '发布成功', icon: 'success' });
          // 隐藏发布对话框
          this.hidePostDialog();
          // 重新加载数据
          this.loadData();
        } else {
          wx.showToast({ title: '发布失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('发布讨论失败:', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ submitting: false });
      }
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
    // 这里可以实现点赞逻辑
    wx.showToast({ title: '点赞成功', icon: 'success' });
  }
});