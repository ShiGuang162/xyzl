// 更新数据库中的图片链接
const db = require('./backend/config/db');

// 新生成的图片链接
const newImages = {
  strategies: [
    {
      id: 1,
      title: '北京三日游攻略',
      image: 'https://p26-aiop-sign.byteimg.com/tos-cn-i-vuqhorh59i/20260221151417D9477FD96D7ED7BE3E30-7478-0~tplv-vuqhorh59i-image-v1.image?rk3s=7f9e702d&x-expires=1771744477&x-signature=KN1X47VUQVlxHKBQKmmsRc0vjL4%3D'
    },
    {
      id: 2,
      title: '上海美食攻略',
      image: 'https://p9-aiop-sign.byteimg.com/tos-cn-i-vuqhorh59i/202602211514435FAD248ED5F53AA1A374-9410-0~tplv-vuqhorh59i-image-v1.image?rk3s=7f9e702d&x-expires=1771744496&x-signature=ZDKDiHXaH3tPKrf2aqRJ56vyzIQ%3D'
    },
    {
      id: 3,
      title: '杭州西湖一日游',
      image: 'https://p26-aiop-sign.byteimg.com/tos-cn-i-vuqhorh59i/20260221151503983104AA1BBB89A227B7-9914-0~tplv-vuqhorh59i-image-v1.image?rk3s=7f9e702d&x-expires=1771744514&x-signature=Hky3QiNbkNsgNsEPYfMzO7FAJp8%3D'
    }
  ]
};

// 更新数据库中的图片链接
async function updateDatabaseImages() {
  try {
    // 测试数据库连接
    await db.testConnection();
    console.log('数据库连接成功');
    
    // 更新攻略表中的图片链接
    for (const strategy of newImages.strategies) {
      const sql = 'UPDATE strategies SET image = ? WHERE id = ?';
      const params = [strategy.image, strategy.id];
      const result = await db.query(sql, params);
      console.log(`更新攻略 ${strategy.title} 的图片链接成功，影响行数: ${result.affectedRows}`);
    }
    
    console.log('所有图片链接更新成功');
  } catch (error) {
    console.error('更新数据库图片链接失败:', error);
  } finally {
    // 关闭数据库连接
    await db.pool.end();
  }
}

// 执行更新操作
updateDatabaseImages();
