// 历史页面逻辑
Page({
  data: {
    // 历史列表数据
    historyList: [
      {
        id: 1,
        title: '历史遗迹',
        description: '承载着悠久的历史文化，见证了时代的变迁',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20history%20relic%2C%20cultural%20heritage%2C%20professional%20photography&image_size=landscape_16_9',
        tags: ['文物', '历史']
      },
      {
        id: 2,
        title: '传统文化',
        description: '丰富多彩的传统习俗和文化活动，传承着民族精神',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20culture%20performance%2C%20colorful%20costumes%2C%20traditional%20music&image_size=landscape_16_9',
        tags: ['文化', '传统']
      },
      {
        id: 3,
        title: '名人典故',
        description: '历史名人的故事和传说，丰富了当地的文化内涵',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20literature%20and%20artifacts%2C%20old%20books%2C%20traditional%20calligraphy&image_size=landscape_16_9',
        tags: ['名人', '故事']
      }
    ]
  },
  
  // 生命周期函数
  onLoad() {
    console.log('历史页面加载');
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 点击历史项
  clickHistory(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点击历史:', id);
    // 这里可以跳转到历史详情页
  }
});