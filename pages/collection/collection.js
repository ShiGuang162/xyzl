// 收藏页面逻辑
Page({
  data: {
    collections: [],
    loading: true
  },

  onLoad() {
    console.log('收藏页面加载');
    this.loadCollections();
  },

  // 加载收藏列表
  loadCollections() {
    this.setData({ loading: true });
    
    // 从本地存储获取收藏数据
    const collections = wx.getStorageSync('collections') || [];
    
    // 模拟收藏数据
    if (collections.length === 0) {
      const mockCollections = [
        {
          id: 1,
          type: 'scenic',
          title: '故宫博物院',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20professional%20photography&image_size=square',
          collectTime: '2026-01-01'
        },
        {
          id: 2,
          type: 'strategy',
          title: '北京三日游攻略',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20professional%20photography&image_size=landscape_16_9',
          collectTime: '2026-01-02'
        },
        {
          id: 3,
          type: 'scenic',
          title: '长城',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%2C%20professional%20photography&image_size=square',
          collectTime: '2026-01-03'
        }
      ];
      
      // 保存到本地存储
      wx.setStorageSync('collections', mockCollections);
      this.setData({ collections: mockCollections, loading: false });
    } else {
      this.setData({ collections, loading: false });
    }
  },

  // 取消收藏
  cancelCollection(e) {
    const id = e.currentTarget.dataset.id;
    console.log('取消收藏:', id);
    
    // 从收藏列表中移除
    const updatedCollections = this.data.collections.filter(item => item.id !== id);
    this.setData({ collections: updatedCollections });
    
    // 更新本地存储
    wx.setStorageSync('collections', updatedCollections);
    
    wx.showToast({ title: '取消收藏成功', icon: 'success' });
  },

  // 点击收藏项
  clickCollection(e) {
    const item = e.currentTarget.dataset.item;
    console.log('点击收藏项:', item);
    
    // 跳转到详情页
    wx.navigateTo({
      url: `/pages/detail/detail?type=${item.type}&id=${item.id}`
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});