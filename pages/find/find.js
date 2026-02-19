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
    discussionList: [
      {
        id: 1,
        tag: '旅游攻略',
        title: '北京三日游攻略',
        content: '刚从北京回来，分享一下我的旅游经验。故宫一定要提前预约，长城建议去慕田峪，人相对少一些。颐和园建议下午去，夕阳下的昆明湖很美。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20forbidden%20city%2C%20great%20wall%2C%20professional%20photography&image_size=landscape_16_9',
        time: '2小时前',
        user: {
          name: '背包客',
          avatar: '背'
        },
        likes: 45,
        comments: 12,
        views: 234
      },
      {
        id: 2,
        tag: '美食推荐',
        title: '成都必吃美食推荐',
        content: '下周要去成都，请问有什么必吃的当地美食推荐吗？最好是本地人常去的店，不是那种 tourist trap。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sichuan%20local%20food%2C%20hotpot%2C%20mapo%20tofu%2C%20professional%20photography&image_size=landscape_16_9',
        time: '3天前',
        user: {
          name: '吃货一枚',
          avatar: '吃'
        },
        likes: 18,
        comments: 20,
        views: 156
      },
      {
        id: 3,
        tag: '景点讨论',
        title: '西湖哪个季节去最好？',
        content: '计划去杭州西湖，请问哪个季节去景色最美？有没有什么推荐的游览路线？',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20traditional%20chinese%20garden%2C%20pagoda%2C%20professional%20photography&image_size=landscape_16_9',
        time: '1天前',
        user: {
          name: '旅行爱好者',
          avatar: '旅'
        },
        likes: 32,
        comments: 15,
        views: 198
      },
      {
        id: 4,
        tag: '交通住宿',
        title: '上海交通攻略',
        content: '第一次去上海，请问地铁怎么乘坐？有没有什么交通卡推荐？住宿住在哪里比较方便？',
        time: '4天前',
        user: {
          name: '新手旅行者',
          avatar: '新'
        },
        likes: 25,
        comments: 18,
        views: 176
      },
      {
        id: 5,
        tag: '旅行故事',
        title: '我的西藏自驾游',
        content: '分享一下我的西藏自驾游经历，沿途风景太美了！但是高原反应一定要注意，建议提前准备氧气袋。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tibet%20road%20trip%2C%20mountain%20landscape%2C%20blue%20sky%2C%20professional%20photography&image_size=landscape_16_9',
        time: '1周前',
        user: {
          name: '自驾达人',
          avatar: '自'
        },
        likes: 67,
        comments: 23,
        views: 345
      }
    ],
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
    
    // 模拟网络请求延迟
    setTimeout(() => {
      // 这里可以调用API获取真实数据
      this.setData({ loading: false });
    }, 1000);
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    console.log('切换分类:', category);
    
    this.setData({ 
      activeCategory: category,
      loading: true 
    });
    
    // 模拟根据分类加载数据
    setTimeout(() => {
      // 这里可以根据分类调用不同的API
      this.setData({ loading: false });
    }, 500);
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
    // 这里可以跳转到讨论详情页
    wx.showToast({ title: '讨论详情页面开发中', icon: 'none' });
  },

  // 点赞讨论
  likeDiscussion(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点赞讨论:', id);
    // 这里可以实现点赞逻辑
    wx.showToast({ title: '点赞成功', icon: 'success' });
  }
});