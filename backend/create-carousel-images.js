#!/usr/bin/env node

// 创建详情页面轮播图图片 - 使用现有图片和复制创建3张轮播图
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createCarouselImages() {
  console.log('开始创建详情页面轮播图...');
  
  try {
    // 连接到数据库
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Mysql@123456',
      database: process.env.DB_NAME || 'xyzl_db'
    });
    
    // 确保uploads目录存在
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // 处理strategies表
    console.log('\n=== 处理strategies表 ===');
    const [strategies] = await connection.query('SELECT id, title, image FROM strategies');
    for (const strategy of strategies) {
      await processItem(connection, 'strategies', strategy);
    }
    
    // 处理scenics表
    console.log('\n=== 处理scenics表 ===');
    const [scenics] = await connection.query('SELECT id, name as title, image FROM scenics');
    for (const scenic of scenics) {
      await processItem(connection, 'scenics', scenic);
    }
    
    // 处理history表
    console.log('\n=== 处理history表 ===');
    const [history] = await connection.query('SELECT id, title, image FROM history');
    for (const item of history) {
      await processItem(connection, 'history', item);
    }
    
    await connection.end();
    console.log('\n✅ 轮播图创建完成！');
    
  } catch (error) {
    console.error('创建轮播图过程中出现错误:', error);
    process.exit(1);
  }
}

async function processItem(connection, tableName, item) {
  console.log(`\n处理: ${item.title} (ID: ${item.id})`);
  
  // 获取当前图片路径
  const currentImage = item.image;
  let imageUrls = [];
  
  if (currentImage) {
    // 如果是本地图片，创建3个变体
    if (currentImage.includes('localhost:3001/uploads/')) {
      // 提取文件名
      const filename = currentImage.split('/').pop();
      const baseName = filename.split('.').slice(0, -1).join('.');
      const ext = filename.split('.').pop();
      
      // 创建3个图片URL（使用相同的图片，但模拟不同的角度/变体）
      for (let i = 1; i <= 3; i++) {
        const newFilename = `${tableName}_${item.id}_carousel_${i}.${ext}`;
        const sourcePath = path.join(__dirname, 'uploads', filename);
        const destPath = path.join(__dirname, 'uploads', newFilename);
        
        // 如果源文件存在，复制它
        if (fs.existsSync(sourcePath)) {
          try {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`  创建轮播图 ${i}: ${newFilename}`);
          } catch (error) {
            console.log(`  复制图片失败: ${error.message}`);
          }
        }
        
        // 添加URL到数组
        imageUrls.push(`http://localhost:3001/uploads/${newFilename}`);
      }
    } else {
      // 如果是外部URL，使用相同的URL3次（模拟轮播）
      console.log(`  使用外部图片: ${currentImage.substring(0, 50)}...`);
      for (let i = 1; i <= 3; i++) {
        imageUrls.push(currentImage);
      }
    }
  } else {
    // 没有图片，使用默认图片
    console.log('  没有图片，使用默认图片');
    for (let i = 1; i <= 3; i++) {
      imageUrls.push(`http://localhost:3001/uploads/default_${tableName}_${i}.jpg`);
    }
  }
  
  // 将图片URL数组保存到数据库的images字段
  const imagesJson = JSON.stringify(imageUrls);
  const updateSql = `UPDATE ${tableName} SET images = ? WHERE id = ?`;
  
  try {
    await connection.query(updateSql, [imagesJson, item.id]);
    console.log(`  ✅ 更新数据库成功，添加了 ${imageUrls.length} 张轮播图`);
    console.log(`  图片URL: ${JSON.stringify(imageUrls)}`);
  } catch (error) {
    console.error(`  ❌ 更新数据库失败: ${error.message}`);
  }
  
  return imageUrls;
}

// 创建一些默认图片（如果不存在）
function createDefaultImages() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  // 创建简单的默认图片
  const defaultImages = [
    'default_strategy_1.jpg',
    'default_strategy_2.jpg', 
    'default_strategy_3.jpg',
    'default_scenic_1.jpg',
    'default_scenic_2.jpg',
    'default_scenic_3.jpg',
    'default_history_1.jpg',
    'default_history_2.jpg',
    'default_history_3.jpg'
  ];
  
  for (const filename of defaultImages) {
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      // 创建一个简单的文本图片
      const text = filename.replace('.jpg', '').replace('_', ' ');
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#4a90e2"/>
  <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dy=".3em">${text}</text>
  <text x="50%" y="60%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">轮播图示例图片</text>
</svg>`;
      
      fs.writeFileSync(filePath.replace('.jpg', '.svg'), svgContent);
      console.log(`创建默认图片: ${filename}`);
    }
  }
}

// 执行
if (require.main === module) {
  createDefaultImages();
  createCarouselImages().catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
}

module.exports = { createCarouselImages, createDefaultImages };