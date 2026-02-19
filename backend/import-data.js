#!/usr/bin/env node

// 数据导入脚本 - 将data.json中的所有数据导入到MySQL数据库
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importData() {
  console.log('开始导入数据...');
  
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'xyzl_db',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ 数据库连接成功');
    
    // 读取data.json文件
    const dataFilePath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('✅ 读取数据文件成功');
    
    // 1. 导入用户数据（为collections和comments做准备）
    console.log('\n1. 导入用户数据...');
    const users = [
      { openid: 'user1', nickname: '微信用户123', avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJLcib4VJj1ibk5e0EiaTia4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4/132', city: '北京', gender: 1 },
      { openid: 'user2', nickname: '微信用户456', avatar_url: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJLcib4VJj1ibk5e0EiaTia4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4/132', city: '上海', gender: 2 }
    ];
    
    for (const user of users) {
      try {
        const [result] = await connection.execute(
          'INSERT IGNORE INTO users (openid, nickname, avatar_url, city, gender) VALUES (?, ?, ?, ?, ?)',
          [user.openid, user.nickname, user.avatar_url, user.city, user.gender]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✅ 创建用户: ${user.nickname}`);
        } else {
          console.log(`  ⚠️ 用户已存在: ${user.nickname}`);
        }
      } catch (err) {
        console.log(`  ❌ 创建用户失败: ${err.message}`);
      }
    }
    
    // 2. 导入攻略数据
    console.log('\n2. 导入攻略数据...');
    for (const strategy of data.strategies) {
      try {
        const [result] = await connection.execute(
          'INSERT IGNORE INTO strategies (id, title, description, image, author, views, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [strategy.id, strategy.title, strategy.desc, strategy.image, strategy.author, strategy.views, strategy.likes, strategy.createdAt]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✅ 导入攻略: ${strategy.title}`);
        } else {
          console.log(`  ⚠️ 攻略已存在: ${strategy.title}`);
        }
      } catch (err) {
        console.log(`  ❌ 导入攻略失败: ${err.message}`);
      }
    }
    
    // 3. 导入景点数据
    console.log('\n3. 导入景点数据...');
    for (const scenic of data.scenics) {
      try {
        const [result] = await connection.execute(
          'INSERT IGNORE INTO scenics (id, name, description, image, address, rating, reviews, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [scenic.id, scenic.name, scenic.desc, scenic.image, scenic.address, scenic.rating, scenic.reviews]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✅ 导入景点: ${scenic.name}`);
        } else {
          console.log(`  ⚠️ 景点已存在: ${scenic.name}`);
        }
      } catch (err) {
        console.log(`  ❌ 导入景点失败: ${err.message}`);
      }
    }
    
    // 4. 导入历史文化数据
    console.log('\n4. 导入历史文化数据...');
    for (const historyItem of data.history) {
      try {
        const [result] = await connection.execute(
          'INSERT IGNORE INTO history (id, title, description, image, period, importance, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [historyItem.id, historyItem.title, historyItem.desc, historyItem.image, historyItem.period, historyItem.importance, historyItem.content]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✅ 导入历史: ${historyItem.title}`);
        } else {
          console.log(`  ⚠️ 历史已存在: ${historyItem.title}`);
        }
      } catch (err) {
        console.log(`  ❌ 导入历史失败: ${err.message}`);
      }
    }
    
    // 5. 导入收藏数据
    console.log('\n5. 导入收藏数据...');
    for (const collection of data.collections) {
      try {
        // 获取用户ID
        const [userResult] = await connection.execute(
          'SELECT id FROM users WHERE openid = ?',
          [collection.userId]
        );
        
        if (userResult.length > 0) {
          const userId = userResult[0].id;
          const [result] = await connection.execute(
            'INSERT IGNORE INTO collections (user_id, item_id, item_type, created_at) VALUES (?, ?, ?, ?)',
            [userId, collection.itemId, collection.itemType, collection.collectedAt]
          );
          if (result.affectedRows > 0) {
            console.log(`  ✅ 导入收藏: ${collection.title}`);
          } else {
            console.log(`  ⚠️ 收藏已存在: ${collection.title}`);
          }
        } else {
          console.log(`  ⚠️ 用户不存在: ${collection.userId}`);
        }
      } catch (err) {
        console.log(`  ❌ 导入收藏失败: ${err.message}`);
      }
    }
    
    // 6. 导入评论数据
    console.log('\n6. 导入评论数据...');
    for (const comment of data.comments) {
      try {
        // 获取用户ID
        const [userResult] = await connection.execute(
          'SELECT id FROM users WHERE openid = ?',
          [comment.userId]
        );
        
        if (userResult.length > 0) {
          const userId = userResult[0].id;
          const [result] = await connection.execute(
            'INSERT IGNORE INTO comments (user_id, item_id, item_type, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [userId, comment.itemId, comment.itemType, comment.content, comment.createdAt]
          );
          if (result.affectedRows > 0) {
            console.log(`  ✅ 导入评论: ${comment.content.substring(0, 20)}...`);
          } else {
            console.log(`  ⚠️ 评论已存在`);
          }
        } else {
          console.log(`  ⚠️ 用户不存在: ${comment.userId}`);
        }
      } catch (err) {
        console.log(`  ❌ 导入评论失败: ${err.message}`);
      }
    }
    
    // 关闭连接
    await connection.end();
    
    console.log('\n✅ 数据导入完成！');
    console.log('\n导入统计:');
    console.log(`- 攻略: ${data.strategies.length}条`);
    console.log(`- 景点: ${data.scenics.length}条`);
    console.log(`- 历史: ${data.history.length}条`);
    console.log(`- 收藏: ${data.collections.length}条`);
    console.log(`- 评论: ${data.comments.length}条`);
    console.log(`- 用户: 2条`);
    
  } catch (error) {
    console.error('❌ 数据导入失败:', error.message);
    process.exit(1);
  }
}

// 运行导入脚本
if (require.main === module) {
  importData();
}

module.exports = { importData };