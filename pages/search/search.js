// 搜索结果页面逻辑
const api = require('../../utils/api');

Page({
  data: {
    keyword: '',
    loading: false,
    searchResults: [],
    noResults: false
  },

  onLoad: function(options) {
    console.log('搜索结果页面加载', options);
    
    // 获取搜索关键词并解码
    if (options.keyword) {
      const decodedKeyword = decodeURIComponent(options.keyword);
      this.setData({ keyword: decodedKeyword });
      // 执行搜索
      this.performSearch(decodedKeyword);
    }
  },

  // 执行搜索
  performSearch(keyword) {
    this.setData({ loading: true, noResults: false });
    
    // 调用搜索API
    api.search(keyword).then(results => {
      this.setData({
        searchResults: results,
        loading: false,
        noResults: results.length === 0
      });
    }).catch(err => {
      console.error('搜索失败:', err);
      this.setData({ loading: false, noResults: true });
    });
  },

  // 点击搜索结果
  clickResult(e) {
    const item = e.currentTarget.dataset.item;
    console.log('点击搜索结果:', item);
    
    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?type=${item.type}&id=${item.id}`
    });
  },

  // 重新搜索
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
  },

  onSearchConfirm() {
    const keyword = this.data.keyword;
    if (keyword.trim()) {
      this.performSearch(keyword);
    }
  },

  // 返回首页
  goBack() {
    wx.navigateBack();
  }
});