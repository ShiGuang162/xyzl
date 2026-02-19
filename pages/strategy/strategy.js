// 攻略页面逻辑
Page({
  data: {
    // 攻略列表数据
    strategyList: [
      {
        id: 1,
        title: '经典一日游攻略',
        description: '带你游览当地最具特色的景点，体验传统文化',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20guide%20photo%2C%20beautiful%20scenery%2C%20professional%20photography&image_size=landscape_16_9',
        tags: ['热门', '经典']
      },
      {
        id: 2,
        title: '美食之旅攻略',
        description: '品尝当地特色美食，了解饮食文化',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20tour%20guide%2C%20local%20delicacies%2C%20colorful%20dishes&image_size=landscape_16_9',
        tags: ['美食', '推荐']
      },
      {
        id: 3,
        title: '文化探索攻略',
        description: '深入了解当地历史文化，参观博物馆和古迹',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cultural%20tour%20guide%2C%20ancient%20buildings%2C%20traditional%20culture&image_size=landscape_16_9',
        tags: ['文化', '历史']
      }
    ]
  },
  
  // 生命周期函数
  onLoad() {
    console.log('攻略页面加载');
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 点击攻略项
  clickStrategy(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点击攻略:', id);
    // 这里可以跳转到攻略详情页
  }
});