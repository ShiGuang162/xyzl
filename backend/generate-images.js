#!/usr/bin/env node

// 生成详情页面轮播图图片
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Seedream API配置
const API_KEY = 'b2ec99ba-9a5f-4a6f-8662-b180874c7203';
const MODEL_ID = 'doubao-seedream-5-0-260128';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

// 图片描述配置 - 为每个详情页面生成3张相关图片的描述
const imagePrompts = {
  // 攻略表
  strategies: [
    {
      id: 1,
      title: '北京三日游攻略',
      prompts: [
        '北京天安门广场日出，庄严的升旗仪式，游客聚集，专业摄影',
        '故宫博物院红墙黄瓦，古代宫殿建筑，游客参观，历史文化',
        '长城蜿蜒在山脊上，雄伟壮观，游客攀登，中国标志性建筑'
      ]
    },
    {
      id: 2,
      title: '上海美食攻略',
      prompts: [
        '上海小笼包特写，热气腾腾，精致摆盘，美食摄影',
        '上海外滩夜景，东方明珠塔，现代建筑，城市风光',
        '上海老字号餐厅，传统装修，顾客用餐，地道美食'
      ]
    },
    {
      id: 3,
      title: '杭州西湖一日游',
      prompts: [
        '杭州西湖断桥残雪，湖面倒影，传统园林，风景如画',
        '西湖三潭印月，古典亭台，湖光山色，江南水乡',
        '杭州龙井茶园，绿色梯田，采茶姑娘，自然风光'
      ]
    }
  ],
  
  // 景点表
  scenics: [
    {
      id: 1,
      title: '故宫博物院',
      prompts: [
        '故宫太和殿全景，金碧辉煌，古代皇家建筑，专业摄影',
        '故宫角楼夜景，灯光璀璨，水面倒影，建筑艺术',
        '故宫文物展览，青铜器瓷器，历史文化，博物馆 interior'
      ]
    },
    {
      id: 2,
      title: '长城',
      prompts: [
        '长城八达岭段，蜿蜒起伏，雄伟壮观，日出美景',
        '长城慕田峪段，绿树环绕，险峻山势，自然风光',
        '长城夜景，灯光照明，星空背景，浪漫氛围'
      ]
    },
    {
      id: 3,
      title: '西湖',
      prompts: [
        '西湖苏堤春晓，柳树成荫，湖面游船，春季美景',
        '西湖雷峰夕照，夕阳西下，塔影湖光，黄昏景色',
        '西湖花港观鱼，锦鲤游动，园林景观，休闲场景'
      ]
    }
  ],
  
  // 历史文化表
  history: [
    {
      id: 1,
      title: '故宫的历史变迁',
      prompts: [
        '故宫明清时期复原图，皇帝上朝，文武百官，历史场景',
        '故宫民国时期老照片，历史变迁，黑白摄影，怀旧风格',
        '故宫现代博物馆 interior，游客参观，文物展示，文化传承'
      ]
    },
    {
      id: 2,
      title: '长城的修建历史',
      prompts: [
        '古代修建长城场景，工匠劳作，建筑材料，历史再现',
        '长城不同时期对比，秦汉明长城，历史演变，示意图',
        '长城现代保护工程，修复工作，文化遗产，保护意义'
      ]
    }
  ]
};

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
      fs.unlink(outputPath, () => {}); // 删除失败的文件
      reject(new Error(`下载错误: ${error.message}`));
    });
  });
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 主函数
async function main() {
  console.log('开始生成详情页面轮播图图片...');
  
  // 创建uploads目录
  const uploadsDir = path.join(__dirname, 'uploads');
  ensureDirectoryExists(uploadsDir);
  
  const results = [];
  
  // 为每个表生成图片
  for (const [tableName, items] of Object.entries(imagePrompts)) {
    console.log(`\n=== 处理 ${tableName} 表 ===`);
    
    for (const item of items) {
      console.log(`\n处理: ${item.title} (ID: ${item.id})`);
      
      const imageUrls = [];
      
      // 为每个项目生成3张图片
      for (let i = 0; i < item.prompts.length; i++) {
        const prompt = item.prompts[i];
        const filename = `${tableName}_${item.id}_${i + 1}_${Date.now()}.jpg`;
        const outputPath = path.join(uploadsDir, filename);
        
        try {
          console.log(`生成第 ${i + 1} 张图片: ${prompt.substring(0, 50)}...`);
          await generateImage(prompt, outputPath);
          
          // 保存相对URL路径
          const relativeUrl = `/uploads/${filename}`;
          imageUrls.push(`http://localhost:3001${relativeUrl}`);
          
          // 添加延迟避免API限制
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`生成图片失败: ${error.message}`);
          // 使用备用图片
          const backupUrl = `http://localhost:3001/uploads/${tableName}_${item.id}.jpg`;
          imageUrls.push(backupUrl);
        }
      }
      
      results.push({
        table: tableName,
        id: item.id,
        title: item.title,
        imageUrls: imageUrls
      });
    }
  }
  
  console.log('\n=== 生成结果汇总 ===');
  console.log(JSON.stringify(results, null, 2));
  
  // 保存结果到文件
  const resultsPath = path.join(__dirname, 'generated-images.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n结果已保存到: ${resultsPath}`);
  
  return results;
}

// 执行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('生成图片过程中出现错误:', error);
    process.exit(1);
  });
}

module.exports = { generateImagePrompts: imagePrompts, main };