// 讨论页 - QQ频道风格逻辑
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
    searching: false
  },

  // 生命周期函数
  onLoad() {
    console.log('讨论页加载');
    // 初始加载数据
    this.loadData();
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
    // 这里可以实现发布讨论的功能
    wx.showToast({ title: '发布讨论功能开发中', icon: 'none' });
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