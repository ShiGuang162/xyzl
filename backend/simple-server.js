const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const PORT = 3001;

// 数据文件路径
const dataFile = path.join(__dirname, 'data.json');

// 加载数据
function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  // 默认数据
  return {
    strategies: [
      {
        id: 1,
        title: '北京三日游攻略',
        desc: '详细的北京三日游行程安排，带你玩转帝都',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20forbidden%20city%2C%20great%20wall%2C%20professional%20photography&image_size=landscape_16_9',
        author: '旅游达人',
        views: 1234,
        likes: 567,
        createdAt: '2026-01-01'
      },
      {
        id: 2,
        title: '上海美食攻略',
        desc: '探寻上海当地特色美食，满足你的味蕾',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20local%20food%2C%20xiaolongbao%2C%20soup%20dumplings%2C%20professional%20photography&image_size=landscape_16_9',
        author: '美食专家',
        views: 987,
        likes: 432,
        createdAt: '2026-01-02'
      },
      {
        id: 3,
        title: '杭州西湖一日游',
        desc: '西湖十景全攻略，领略江南水乡之美',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20west%20lake%2C%20traditional%20chinese%20garden%2C%20scenic%20view%2C%20professional%20photography&image_size=landscape_16_9',
        author: '旅行博主',
        views: 765,
        likes: 321,
        createdAt: '2026-01-03'
      }
    ],
    scenics: [
      {
        id: 1,
        name: '故宫博物院',
        desc: '中国明清两代的皇家宫殿，世界文化遗产',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20ancient%20chinese%20palace%2C%20red%20walls%2C%20professional%20photography&image_size=square',
        address: '北京市东城区景山前街4号',
        rating: 4.8,
        reviews: 12345
      },
      {
        id: 2,
        name: '长城',
        desc: '中国古代伟大的防御工程，世界文化遗产',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%2C%20mountain%20landscape%2C%20ancient%20architecture%2C%20professional%20photography&image_size=square',
        address: '北京市怀柔区',
        rating: 4.9,
        reviews: 23456
      },
      {
        id: 3,
        name: '西湖',
        desc: '杭州西湖，中国著名的风景名胜区',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20traditional%20chinese%20garden%2C%20pagoda%2C%20professional%20photography&image_size=square',
        address: '浙江省杭州市西湖区',
        rating: 4.7,
        reviews: 18901
      }
    ],
    history: [
      {
        id: 1,
        title: '故宫的历史变迁',
        desc: '从明清宫殿到现代博物馆的演变历程',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20history%2C%20ancient%20chinese%20palace%2C%20historical%20photography&image_size=landscape_16_9',
        period: '明清时期',
        importance: '世界文化遗产',
        content: '故宫又称紫禁城，是中国明清两代的皇家宫殿，始建于明永乐四年（1406年），是世界上现存规模最大、保存最为完整的木质结构古建筑之一。'
      },
      {
        id: 2,
        title: '长城的修建历史',
        desc: '从春秋战国到明清时期的长城建设',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20history%2C%20ancient%20chinese%20fortification%2C%20historical%20photography&image_size=landscape_16_9',
        period: '春秋战国至明清',
        importance: '世界文化遗产',
        content: '长城是中国古代的伟大防御工程，始建于春秋战国时期，秦统一六国后连接和修缮了战国长城，此后汉、明等朝代不断修筑，成为世界上最伟大的建筑之一。'
      }
    ],
    collections: [
      {
        id: 1,
        userId: 'user1',
        itemId: 1,
        itemType: 'strategy',
        title: '北京三日游攻略',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20forbidden%20city%2C%20great%20wall%2C%20professional%20photography&image_size=landscape_16_9',
        collectedAt: '2026-01-10'
      },
      {
        id: 2,
        userId: 'user1',
        itemId: 1,
        itemType: 'scenic',
        title: '故宫博物院',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20ancient%20chinese%20palace%2C%20red%20walls%2C%20professional%20photography&image_size=square',
        collectedAt: '2026-01-11'
      }
    ],
    comments: [
      {
        id: 1,
        userId: 'user1',
        itemId: 1,
        itemType: 'strategy',
        content: '这个攻略非常详细，很有帮助！',
        author: '微信用户123',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJLcib4VJj1ibk5e0EiaTia4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4/132',
        createdAt: '2026-01-05',
        likes: 12
      },
      {
        id: 2,
        userId: 'user2',
        itemId: 1,
        itemType: 'strategy',
        content: '谢谢分享，已经收藏了',
        author: '微信用户456',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJLcib4VJj1ibk5e0EiaTia4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4/132',
        createdAt: '2026-01-06',
        likes: 8
      }
    ]
  };
}

// 保存数据
function saveData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// 模拟数据
let mockData = loadData();

// 保存初始数据
saveData(mockData);

// 创建服务器
const server = http.createServer((req, res) => {
  // 解析请求URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // 处理静态文件请求
  if (req.method === 'GET' && pathname === '/admin') {
    const filePath = path.join(__dirname, 'admin.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(content, 'utf-8');
      }
    });
    return;
  }
  
  // 处理API请求
  if (req.method === 'GET') {
    // 处理单个项目的GET请求
    if (pathname.match(/^\/api\/strategies\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const strategy = mockData.strategies.find(s => s.id === id);
      if (strategy) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(strategy));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      return;
    }
    
    if (pathname.match(/^\/api\/scenics\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const scenic = mockData.scenics.find(s => s.id === id);
      if (scenic) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(scenic));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      return;
    }
    
    if (pathname.match(/^\/api\/history\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const history = mockData.history.find(h => h.id === id);
      if (history) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(history));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      return;
    }
    
    // 处理列表GET请求
    if (pathname === '/api/strategies') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(mockData.strategies));
    } else if (pathname === '/api/scenics') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(mockData.scenics));
    } else if (pathname === '/api/search') {
      const keyword = parsedUrl.query.keyword || '';
      // 模拟搜索结果
      const results = [
        {
          id: 1,
          type: 'strategy',
          title: keyword + '旅游攻略',
          desc: '详细的' + keyword + '旅游指南，带你玩转当地',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20guide%20photo%2C%20beautiful%20scenery%2C%20professional%20photography&image_size=landscape_16_9'
        },
        {
          id: 2,
          type: 'scenic',
          title: keyword + '景点推荐',
          desc: '精选' + keyword + '热门景点，不容错过',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scenic%20spot%20photo%2C%20mountain%20view%2C%20clear%20weather%2C%20professional%20photography&image_size=square'
        }
      ];
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(results));
    } else if (pathname === '/api/health') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', message: 'Backend service is running' }));
    } else if (pathname === '/api/history') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(mockData.history));
    } else if (pathname === '/api/collections') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(mockData.collections));
    } else if (pathname === '/api/comments') {
      const itemId = parsedUrl.query.itemId;
      const itemType = parsedUrl.query.itemType;
      if (itemId && itemType) {
        const filteredComments = mockData.comments.filter(comment => 
          comment.itemId == itemId && comment.itemType === itemType
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(filteredComments));
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(mockData.comments));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } else if (req.method === 'POST') {
    // 处理POST请求（添加新数据）
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (pathname === '/api/strategies') {
          const newId = Math.max(...mockData.strategies.map(s => s.id)) + 1;
          const newStrategy = {
            id: newId,
            ...data
          };
          mockData.strategies.push(newStrategy);
          saveData(mockData);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: newStrategy }));
        } else if (pathname === '/api/scenics') {
          const newId = Math.max(...mockData.scenics.map(s => s.id)) + 1;
          const newScenic = {
            id: newId,
            ...data
          };
          mockData.scenics.push(newScenic);
          saveData(mockData);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: newScenic }));
        } else if (pathname === '/api/history') {
          const newId = Math.max(...mockData.history.map(h => h.id)) + 1;
          const newHistory = {
            id: newId,
            ...data
          };
          mockData.history.push(newHistory);
          saveData(mockData);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: newHistory }));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'PUT') {
    // 处理PUT请求（更新数据）
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (pathname.match(/^\/api\/strategies\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          const index = mockData.strategies.findIndex(s => s.id === id);
          if (index !== -1) {
            mockData.strategies[index] = {
              id: id,
              ...data
            };
            saveData(mockData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: mockData.strategies[index] }));
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
          }
        } else if (pathname.match(/^\/api\/scenics\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          const index = mockData.scenics.findIndex(s => s.id === id);
          if (index !== -1) {
            mockData.scenics[index] = {
              id: id,
              ...data
            };
            saveData(mockData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: mockData.scenics[index] }));
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
          }
        } else if (pathname.match(/^\/api\/history\/\d+$/)) {
          const id = parseInt(pathname.split('/').pop());
          const index = mockData.history.findIndex(h => h.id === id);
          if (index !== -1) {
            mockData.history[index] = {
              id: id,
              ...data
            };
            saveData(mockData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: mockData.history[index] }));
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not Found' }));
          }
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'DELETE') {
    // 处理DELETE请求（删除数据）
    if (pathname.match(/^\/api\/strategies\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const index = mockData.strategies.findIndex(s => s.id === id);
      if (index !== -1) {
        mockData.strategies.splice(index, 1);
        saveData(mockData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } else if (pathname.match(/^\/api\/scenics\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const index = mockData.scenics.findIndex(s => s.id === id);
      if (index !== -1) {
        mockData.scenics.splice(index, 1);
        saveData(mockData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } else if (pathname.match(/^\/api\/history\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const index = mockData.history.findIndex(h => h.id === id);
      if (index !== -1) {
        mockData.history.splice(index, 1);
        saveData(mockData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } else if (pathname.match(/^\/api\/collections\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const index = mockData.collections.findIndex(c => c.id === id);
      if (index !== -1) {
        mockData.collections.splice(index, 1);
        saveData(mockData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } else if (pathname.match(/^\/api\/comments\/\d+$/)) {
      const id = parseInt(pathname.split('/').pop());
      const index = mockData.comments.findIndex(c => c.id === id);
      if (index !== -1) {
        mockData.comments.splice(index, 1);
        saveData(mockData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } else {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`Simple backend server running on http://localhost:${PORT}`);
});