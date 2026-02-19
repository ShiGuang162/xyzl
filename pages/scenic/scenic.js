// 景点页面逻辑
Page({
  data: {
    // 景点列表数据
    scenicList: [
      {
        id: 1,
        name: '青山绿水',
        description: '风景秀丽，空气清新，是休闲度假的好去处',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scenic%20spot%20photo%2C%20mountain%20view%2C%20clear%20weather%2C%20professional%20photography&image_size=square',
        tags: ['自然', '休闲']
      },
      {
        id: 2,
        name: '古寺名刹',
        description: '历史悠久，文化底蕴深厚，建筑风格独特',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20temple%20scenic%20spot%2C%20traditional%20chinese%20architecture%2C%20peaceful%20environment&image_size=square',
        tags: ['历史', '文化']
      },
      {
        id: 3,
        name: '水乡古镇',
        description: '小桥流水，古朴典雅，展现江南水乡特色',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20village%2C%20ancient%20buildings%2C%20calm%20river%2C%20professional%20photography&image_size=square',
        tags: ['古镇', '水乡']
      }
    ]
  },
  
  // 生命周期函数
  onLoad() {
    console.log('景点页面加载');
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 点击景点项
  clickScenic(e) {
    const id = e.currentTarget.dataset.id;
    console.log('点击景点:', id);
    // 这里可以跳转到景点详情页
  }
});