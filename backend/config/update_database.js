// 更新数据库结构
const db = require('./db');

async function updateDatabase() {
  try {
    console.log('开始更新数据库结构...');

    // 为strategies表添加字段
    const strategyFields = [
      { name: 'content', type: 'TEXT' },
      { name: 'images', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' },
      { name: 'comments', type: 'INT DEFAULT 0' }
    ];

    for (const field of strategyFields) {
      try {
        // 检查字段是否存在
        const checkSql = `SHOW COLUMNS FROM strategies LIKE '${field.name}'`;
        const result = await db.query(checkSql);
        
        if (result.length === 0) {
          // 字段不存在，添加字段
          const addSql = `ALTER TABLE strategies ADD COLUMN ${field.name} ${field.type}`;
          await db.query(addSql);
          console.log(`为strategies表添加${field.name}字段成功`);
        } else {
          console.log(`strategies表已存在${field.name}字段，跳过添加`);
        }
      } catch (error) {
        console.error(`处理strategies表${field.name}字段时出错:`, error);
      }
    }

    // 为scenics表添加字段
    const scenicFields = [
      { name: 'content', type: 'TEXT' },
      { name: 'images', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' },
      { name: 'comments', type: 'INT DEFAULT 0' },
      { name: 'views', type: 'INT DEFAULT 0' }
    ];

    for (const field of scenicFields) {
      try {
        // 检查字段是否存在
        const checkSql = `SHOW COLUMNS FROM scenics LIKE '${field.name}'`;
        const result = await db.query(checkSql);
        
        if (result.length === 0) {
          // 字段不存在，添加字段
          const addSql = `ALTER TABLE scenics ADD COLUMN ${field.name} ${field.type}`;
          await db.query(addSql);
          console.log(`为scenics表添加${field.name}字段成功`);
        } else {
          console.log(`scenics表已存在${field.name}字段，跳过添加`);
        }
      } catch (error) {
        console.error(`处理scenics表${field.name}字段时出错:`, error);
      }
    }

    // 为history表添加字段
    const historyFields = [
      { name: 'content', type: 'TEXT' },
      { name: 'images', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' },
      { name: 'comments', type: 'INT DEFAULT 0' },
      { name: 'views', type: 'INT DEFAULT 0' },
      { name: 'likes', type: 'INT DEFAULT 0' }
    ];

    for (const field of historyFields) {
      try {
        // 检查字段是否存在
        const checkSql = `SHOW COLUMNS FROM history LIKE '${field.name}'`;
        const result = await db.query(checkSql);
        
        if (result.length === 0) {
          // 字段不存在，添加字段
          const addSql = `ALTER TABLE history ADD COLUMN ${field.name} ${field.type}`;
          await db.query(addSql);
          console.log(`为history表添加${field.name}字段成功`);
        } else {
          console.log(`history表已存在${field.name}字段，跳过添加`);
        }
      } catch (error) {
        console.error(`处理history表${field.name}字段时出错:`, error);
      }
    }

    console.log('数据库结构更新完成');
  } catch (error) {
    console.error('更新数据库结构失败:', error);
  } finally {
    // 关闭数据库连接
    if (db.pool) {
      await db.pool.end();
    }
  }
}

// 执行更新
updateDatabase();