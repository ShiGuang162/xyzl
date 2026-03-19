#!/usr/bin/env node

// 为故宫历史变迁生成正确的相关图片
const fs = require('fs');
const path = require('path');
const https = require('https');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Seedream API配置
const API_KEY = 'b2ec99ba-9a5f-4a6f-8662-b180874c7203';
const MODEL_ID = 'doubao-seedream-5-0-260128';

// 故宫历史变迁的图片描述
const forbiddenCityPrompts = [
  '故宫太和殿全景，明清皇家宫殿建筑，红墙黄瓦，金碧辉煌，专业摄影，建筑艺术',
  '故宫角楼夜景，水面倒影，古代建筑美学，传统中国风格，灯光璀璨',
  '故宫博物院文物展览，古代青铜器、瓷器展示，历史文化，博物馆内部'
];

// 生成图片的函数
async function generateImage(prompt, outputPath) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      model: MODEL_ID,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url'
    });

    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      port: 443,
      path: '/api/v3/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestData.length,
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data[0] && response.data[0].url) {
            const imageUrl = response.data[0].url;
            console.log(`图片生成成功: ${prompt.substring(0, 50)}...`);
            downloadImage(imageUrl, outputPath).then(resolve).catch(reject);
          } else {
            reject(new Error(`API返回格式错误: ${data}`));
          }
        } catch (error) {
          reject(new Error(`解析API响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });

    req.write(requestData);
    req.end();
  });
}

// 下载图片到本地
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`图片已保存到: ${outputPath}`);
        resolve(outputPath);
      });
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {});
      reject(new Error(`下载错误: ${error.message}`));
    });
  });
}

// 主函数
async function main() {
  console.log('开始为故宫历史变迁生成正确的相关图片...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const imageUrls = [];
  
  // 生成3张图片
  for (let i = 0; i < forbiddenCityPrompts.length; i++) {
    const prompt = forbiddenCityPrompts[i];
    const filename = `history_1_carousel_${i + 1}_${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, filename);
    
    try {
      console.log(`\n生成第 ${i + 1} 张图片: ${prompt.substring(0, 60)}...`);
      await generateImage(prompt, outputPath);
      imageUrls.push(`http://localhost:3001/uploads/${filename}`);
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`生成图片失败: ${error.message}`);
      // 使用现有图片作为备用
      const backupFilename = `history_1_carousel_${i + 1}.jpg`;
      if (fs.existsSync(path.join(uploadsDir, backupFilename))) {
        imageUrls.push(`http://localhost:3001/uploads/${backupFilename}`);
        console.log(`使用备用图片: ${backupFilename}`);
      }
    }
  }
  
  // 更新数据库
  console.log('\n更新数据库...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Mysql@123456',
    database: process.env.DB_NAME || 'xyzl_db'
  });
  
  // 更新images字段
  const imagesJson = JSON.stringify(imageUrls);
  await connection.query('UPDATE history SET images = ? WHERE id = 1', [imagesJson]);
  
  // 更新image字段（使用第一张图片）
  if (imageUrls.length > 0) {
    await connection.query('UPDATE history SET image = ? WHERE id = 1', [imageUrls[0]]);
  }
  
  await connection.end();
  
  console.log('\n✅ 完成！');
  console.log('生成的图片:');
  imageUrls.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
}

// 执行
if (require.main === module) {
  main().catch(error => {
    console.error('执行失败:', error);
    process.exit(1);
  });
}

module.exports = { main };
