const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const logger = require('./utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.body.userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3001;

// 启用 CORS
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // 增加请求体大小限制

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 根目录静态文件服务，用于提供管理页面
app.use(express.static(__dirname));

// 请求日志中间件
app.use(logger.requestLogger);

// 测试数据库连接
db.testConnection().catch(err => {
  logger.error('数据库初始化失败:', err);
});

// API 接口 - 获取攻略列表
app.get('/api/strategies', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = 'SELECT * FROM strategies ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const results = await db.query(sql, [parseInt(limit), offset]);
    
    // 获取总数用于分页
    const countSql = 'SELECT COUNT(*) as total FROM strategies';
    const countResult = await db.query(countSql, []);
    const total = countResult[0].total;
    
    res.json({
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('获取攻略列表错误:', error);
    res.status(500).json({ error: '获取攻略列表失败' });
  }
});

// API 接口 - 根据ID获取单个攻略
app.get('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM strategies WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: '攻略不存在' });
    }
    
    res.json(results[0]);
  } catch (error) {
    logger.error('获取攻略详情错误:', error);
    res.status(500).json({ error: '获取攻略详情失败' });
  }
});

// API 接口 - 创建攻略
app.post('/api/strategies', async (req, res) => {
  try {
    const { title, description, image, author } = req.body;
    const sql = 'INSERT INTO strategies (title, description, image, author) VALUES (?, ?, ?, ?)';
    const result = await db.query(sql, [title, description, image, author]);
    
    // 返回新创建的攻略
    const newStrategySql = 'SELECT * FROM strategies WHERE id = ?';
    const newStrategy = await db.query(newStrategySql, [result.insertId]);
    
    res.status(201).json({ success: true, data: newStrategy[0] });
  } catch (error) {
    logger.error('创建攻略错误:', error);
    res.status(500).json({ error: '创建攻略失败' });
  }
});

// API 接口 - 更新攻略
app.put('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, author } = req.body;
    const sql = 'UPDATE strategies SET title = ?, description = ?, image = ?, author = ? WHERE id = ?';
    await db.query(sql, [title, description, image, author, id]);
    
    // 返回更新后的攻略
    const updatedStrategySql = 'SELECT * FROM strategies WHERE id = ?';
    const updatedStrategy = await db.query(updatedStrategySql, [id]);
    
    res.json({ success: true, data: updatedStrategy[0] });
  } catch (error) {
    logger.error('更新攻略错误:', error);
    res.status(500).json({ error: '更新攻略失败' });
  }
});

// API 接口 - 删除攻略
app.delete('/api/strategies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM strategies WHERE id = ?';
    await db.query(sql, [id]);
    
    res.json({ success: true, message: '攻略删除成功' });
  } catch (error) {
    logger.error('删除攻略错误:', error);
    res.status(500).json({ error: '删除攻略失败' });
  }
});

// API 接口 - 获取景点列表
app.get('/api/scenics', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = 'SELECT * FROM scenics ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const results = await db.query(sql, [parseInt(limit), offset]);
    
    // 获取总数用于分页
    const countSql = 'SELECT COUNT(*) as total FROM scenics';
    const countResult = await db.query(countSql, []);
    const total = countResult[0].total;
    
    res.json({
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('获取景点列表错误:', error);
    res.status(500).json({ error: '获取景点列表失败' });
  }
});

// API 接口 - 根据ID获取单个景点
app.get('/api/scenics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM scenics WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: '景点不存在' });
    }
    
    res.json(results[0]);
  } catch (error) {
    logger.error('获取景点详情错误:', error);
    res.status(500).json({ error: '获取景点详情失败' });
  }
});

// API 接口 - 创建景点
app.post('/api/scenics', async (req, res) => {
  try {
    const { name, description, image, address, rating, reviews } = req.body;
    const sql = 'INSERT INTO scenics (name, description, image, address, rating, reviews) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await db.query(sql, [name, description, image, address, rating, reviews]);
    
    // 返回新创建的景点
    const newScenicSql = 'SELECT * FROM scenics WHERE id = ?';
    const newScenic = await db.query(newScenicSql, [result.insertId]);
    
    res.status(201).json({ success: true, data: newScenic[0] });
  } catch (error) {
    console.error('创建景点错误:', error);
    res.status(500).json({ error: '创建景点失败' });
  }
});

// API 接口 - 更新景点
app.put('/api/scenics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, address, rating, reviews } = req.body;
    const sql = 'UPDATE scenics SET name = ?, description = ?, image = ?, address = ?, rating = ?, reviews = ? WHERE id = ?';
    await db.query(sql, [name, description, image, address, rating, reviews, id]);
    
    // 返回更新后的景点
    const updatedScenicSql = 'SELECT * FROM scenics WHERE id = ?';
    const updatedScenic = await db.query(updatedScenicSql, [id]);
    
    res.json({ success: true, data: updatedScenic[0] });
  } catch (error) {
    console.error('更新景点错误:', error);
    res.status(500).json({ error: '更新景点失败' });
  }
});

// API 接口 - 删除景点
app.delete('/api/scenics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM scenics WHERE id = ?';
    await db.query(sql, [id]);
    
    res.json({ success: true, message: '景点删除成功' });
  } catch (error) {
    console.error('删除景点错误:', error);
    res.status(500).json({ error: '删除景点失败' });
  }
});

// API 接口 - 获取历史文化列表
app.get('/api/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const sql = 'SELECT * FROM history ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const results = await db.query(sql, [parseInt(limit), offset]);
    
    // 获取总数用于分页
    const countSql = 'SELECT COUNT(*) as total FROM history';
    const countResult = await db.query(countSql, []);
    const total = countResult[0].total;
    
    res.json({
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取历史文化列表错误:', error);
    res.status(500).json({ error: '获取历史文化列表失败' });
  }
});

// API 接口 - 根据ID获取单个历史文化
app.get('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM history WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: '历史文化记录不存在' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('获取历史文化详情错误:', error);
    res.status(500).json({ error: '获取历史文化详情失败' });
  }
});

// API 接口 - 创建历史文化
app.post('/api/history', async (req, res) => {
  try {
    const { title, description, image, period, importance, content } = req.body;
    const sql = 'INSERT INTO history (title, description, image, period, importance, content) VALUES (?, ?, ?, ?, ?, ?)';
    const result = await db.query(sql, [title, description, image, period, importance, content]);
    
    // 返回新创建的历史文化记录
    const newHistorySql = 'SELECT * FROM history WHERE id = ?';
    const newHistory = await db.query(newHistorySql, [result.insertId]);
    
    res.status(201).json({ success: true, data: newHistory[0] });
  } catch (error) {
    console.error('创建历史文化错误:', error);
    res.status(500).json({ error: '创建历史文化失败' });
  }
});

// API 接口 - 更新历史文化
app.put('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, period, importance, content } = req.body;
    const sql = 'UPDATE history SET title = ?, description = ?, image = ?, period = ?, importance = ?, content = ? WHERE id = ?';
    await db.query(sql, [title, description, image, period, importance, content, id]);
    
    // 返回更新后的历史文化记录
    const updatedHistorySql = 'SELECT * FROM history WHERE id = ?';
    const updatedHistory = await db.query(updatedHistorySql, [id]);
    
    res.json({ success: true, data: updatedHistory[0] });
  } catch (error) {
    console.error('更新历史文化错误:', error);
    res.status(500).json({ error: '更新历史文化失败' });
  }
});

// API 接口 - 删除历史文化
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM history WHERE id = ?';
    await db.query(sql, [id]);
    
    res.json({ success: true, message: '历史文化记录删除成功' });
  } catch (error) {
    console.error('删除历史文化错误:', error);
    res.status(500).json({ error: '删除历史文化失败' });
  }
});

// API 接口 - 搜索功能
app.get('/api/search', async (req, res) => {
  try {
    const keyword = req.query.keyword ? req.query.keyword.toString() : '';
    
    if (!keyword.trim()) {
      return res.json([]);
    }
    
    // 在攻略、景点和历史文化中搜索
    const strategiesSql = 'SELECT id, title, "strategy" as type, description, image FROM strategies WHERE title LIKE ? OR description LIKE ?';
    const scenicsSql = 'SELECT id, name, "scenic" as type, description, image FROM scenics WHERE name LIKE ? OR description LIKE ?';
    const historySql = 'SELECT id, title, "history" as type, description, image FROM history WHERE title LIKE ? OR description LIKE ?';
    
    const searchTerm = `%${keyword}%`;
    
    // 分别执行查询
    const strategiesResults = await db.query(strategiesSql, [searchTerm, searchTerm]);
    const scenicsResults = await db.query(scenicsSql, [searchTerm, searchTerm]);
    const historyResults = await db.query(historySql, [searchTerm, searchTerm]);
    
    // 合并所有搜索结果
    const results = [];
    
    // 处理攻略结果
    strategiesResults.forEach(item => {
      results.push({
        id: item.id,
        title: item.title,
        desc: item.description,
        image: item.image,
        type: item.type
      });
    });
    
    // 处理景点结果
    scenicsResults.forEach(item => {
      results.push({
        id: item.id,
        title: item.name, // 景点使用name作为title
        desc: item.description,
        image: item.image,
        type: item.type
      });
    });
    
    // 处理历史文化结果
    historyResults.forEach(item => {
      results.push({
        id: item.id,
        title: item.title,
        desc: item.description,
        image: item.image,
        type: item.type
      });
    });
    
    console.log('搜索关键词:', keyword);
    console.log('搜索结果数量:', results.length);
    console.log('搜索结果:', results);
    
    res.json(results);
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// API 接口 - 获取收藏列表
app.get('/api/collections', async (req, res) => {
  try {
    const userId = req.query.userId;
    
    let sql, params;
    if (userId) {
      // 获取特定用户的收藏
      sql = `
        SELECT c.id, c.user_id, c.item_id, c.item_type, s.title, s.description, s.image, s.author, 
               sc.name as scenic_name, h.title as history_title, c.created_at
        FROM collections c
        LEFT JOIN strategies s ON (c.item_type = 'strategy' AND c.item_id = s.id)
        LEFT JOIN scenics sc ON (c.item_type = 'scenic' AND c.item_id = sc.id)
        LEFT JOIN history h ON (c.item_type = 'history' AND c.item_id = h.id)
        WHERE c.user_id = ?
      `;
      params = [userId];
    } else {
      // 获取所有收藏
      sql = `
        SELECT c.id, c.user_id, c.item_id, c.item_type, s.title, s.description, s.image, s.author, 
               sc.name as scenic_name, h.title as history_title, c.created_at
        FROM collections c
        LEFT JOIN strategies s ON (c.item_type = 'strategy' AND c.item_id = s.id)
        LEFT JOIN scenics sc ON (c.item_type = 'scenic' AND c.item_id = sc.id)
        LEFT JOIN history h ON (c.item_type = 'history' AND c.item_id = h.id)
      `;
      params = [];
    }
    
    const results = await db.query(sql, params);
    
    // 格式化结果
    const formattedResults = results.map(item => {
      return {
        id: item.id,
        user_id: item.user_id,
        item_id: item.item_id,
        item_type: item.item_type,
        title: item.title || item.scenic_name || item.history_title,
        description: item.description,
        image: item.image,
        author: item.author,
        created_at: item.created_at
      };
    });
    
    res.json({ data: formattedResults });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// API 接口 - 添加收藏
app.post('/api/collections', async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;
    
    if (!userId || !itemId || !itemType) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 检查是否已收藏
    const checkSql = 'SELECT id FROM collections WHERE user_id = ? AND item_id = ? AND item_type = ?';
    const checkResult = await db.query(checkSql, [userId, itemId, itemType]);
    
    if (checkResult.length > 0) {
      return res.status(409).json({ error: '已收藏此项目' });
    }
    
    const sql = 'INSERT INTO collections (user_id, item_id, item_type) VALUES (?, ?, ?)';
    const result = await db.query(sql, [userId, itemId, itemType]);
    
    res.status(201).json({ success: true, message: '收藏成功', id: result.insertId });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '收藏失败' });
  }
});

// API 接口 - 删除收藏
app.delete('/api/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM collections WHERE id = ?';
    await db.query(sql, [id]);
    
    res.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ error: '取消收藏失败' });
  }
});

// API 接口 - 获取评论列表
app.get('/api/comments', async (req, res) => {
  try {
    const { itemId, itemType } = req.query;
    
    let sql, params;
    if (itemId && itemType) {
      // 获取特定项目的评论
      sql = `
        SELECT c.*, u.nickname, u.avatar_url 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.item_id = ? AND c.item_type = ?
        ORDER BY c.created_at ASC
      `;
      params = [itemId, itemType];
    } else {
      // 获取所有评论
      sql = `
        SELECT c.*, u.nickname, u.avatar_url 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at ASC
      `;
      params = [];
    }
    
    const results = await db.query(sql, params);
    
    res.json({ data: results });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

// API 接口 - 添加评论
app.post('/api/comments', async (req, res) => {
  try {
    const { userId, itemId, itemType, content, parentId } = req.body;
    
    if (!userId || !itemId || !itemType || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const sql = 'INSERT INTO comments (user_id, item_id, item_type, content, parent_id) VALUES (?, ?, ?, ?, ?)';
    const result = await db.query(sql, [userId, itemId, itemType, content, parentId || null]);
    
    // 获取刚插入的评论
    const commentSql = 'SELECT c.*, u.nickname, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?';
    const comment = await db.query(commentSql, [result.insertId]);
    
    res.status(201).json({ success: true, data: comment[0] });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ error: '添加评论失败' });
  }
});

// API 接口 - 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await db.testConnection();
    res.json({ status: 'ok', message: 'Backend service is running with MySQL database' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// API 接口 - 获取讨论列表
app.get('/api/discussions', async (req, res) => {
  try {
    const { page = 1, limit = 10, category = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // 分类映射，将前端发送的分类值映射到数据库中的tag值
    const categoryMap = {
      'all': 'all',
      'strategy': '旅游攻略',
      'food': '美食推荐',
      'scenic': '景点讨论',
      'transport': '交通住宿',
      'story': '旅行故事',
      'other': '其他话题'
    };
    
    const actualCategory = categoryMap[category] || 'all';
    
    let sql = 'SELECT * FROM discussions ORDER BY created_at DESC LIMIT ? OFFSET ?';
    let params = [parseInt(limit), offset];
    
    if (actualCategory !== 'all') {
      sql = 'SELECT * FROM discussions WHERE tag = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params = [actualCategory, parseInt(limit), offset];
    }
    
    const results = await db.query(sql, params);
    
    // 获取总数用于分页
    const countSql = actualCategory !== 'all' ? 'SELECT COUNT(*) as total FROM discussions WHERE tag = ?' : 'SELECT COUNT(*) as total FROM discussions';
    const countParams = actualCategory !== 'all' ? [actualCategory] : [];
    const countResult = await db.query(countSql, countParams);
    const total = countResult[0].total;
    
    // 格式化结果
    const formattedResults = results.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      tag: item.tag,
      image: item.image,
      time: item.created_at,
      user: {
        name: item.user_name,
        avatar: item.user_avatar
      },
      likes: item.likes,
      comments: item.comments,
      views: item.views
    }));
    
    res.json({
      data: formattedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取讨论列表错误:', error);
    res.status(500).json({ error: '获取讨论列表失败' });
  }
});

// API 接口 - 发布讨论
app.post('/api/discussions', async (req, res) => {
  try {
    const { title, content, tag, user_id, user_name, user_avatar, image } = req.body;
    
    // 验证必要参数
    if (!title || !content || !tag || !user_id || !user_name || !user_avatar) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 插入讨论数据
    const sql = `
      INSERT INTO discussions (title, content, tag, user_id, user_name, user_avatar, image, likes, comments, views, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW(), NOW())
    `;
    
    const params = [title, content, tag, user_id, user_name, user_avatar, image || null];
    const result = await db.query(sql, params);
    
    // 获取刚插入的讨论
    const getSql = 'SELECT * FROM discussions WHERE id = ?';
    const newDiscussion = await db.query(getSql, [result.insertId]);
    
    // 格式化结果
    const formattedDiscussion = {
      id: newDiscussion[0].id,
      title: newDiscussion[0].title,
      content: newDiscussion[0].content,
      tag: newDiscussion[0].tag,
      image: newDiscussion[0].image,
      time: newDiscussion[0].created_at,
      user: {
        name: newDiscussion[0].user_name,
        avatar: newDiscussion[0].user_avatar
      },
      likes: newDiscussion[0].likes,
      comments: newDiscussion[0].comments,
      views: newDiscussion[0].views
    };
    
    res.status(201).json({ success: true, data: formattedDiscussion });
  } catch (error) {
    console.error('发布讨论错误:', error);
    res.status(500).json({ error: '发布讨论失败' });
  }
});

// API 接口 - 获取用户自己的讨论列表
app.get('/api/discussions/user', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: '缺少用户ID' });
    }
    
    // 从数据库获取用户的讨论列表
    const sql = 'SELECT * FROM discussions WHERE user_id = ? ORDER BY created_at DESC';
    const results = await db.query(sql, [user_id]);
    
    // 格式化结果
    const formattedResults = results.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      tag: item.tag,
      image: item.image,
      time: item.created_at,
      user: {
        name: item.user_name,
        avatar: item.user_avatar
      },
      likes: item.likes,
      comments: item.comments,
      views: item.views
    }));
    
    res.json({
      data: formattedResults,
      pagination: {
        page: 1,
        limit: 100,
        total: formattedResults.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('获取用户讨论列表错误:', error);
    res.status(500).json({ error: '获取用户讨论列表失败' });
  }
});

// API 接口 - 获取讨论详情
app.get('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取讨论详情
    const sql = 'SELECT * FROM discussions WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: '讨论不存在' });
    }
    
    const discussion = results[0];
    
    // 增加浏览量
    await db.query('UPDATE discussions SET views = views + 1 WHERE id = ?', [id]);
    
    // 格式化结果
    const formattedDiscussion = {
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      tag: discussion.tag,
      image: discussion.image,
      time: discussion.created_at,
      user: {
        name: discussion.user_name,
        avatar: discussion.user_avatar
      },
      likes: discussion.likes,
      comments: discussion.comments,
      views: discussion.views + 1
    };
    
    res.json(formattedDiscussion);
  } catch (error) {
    console.error('获取讨论详情错误:', error);
    res.status(500).json({ error: '获取讨论详情失败' });
  }
});

// API 接口 - 获取讨论评论
app.get('/api/discussions/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = 'SELECT * FROM discussion_comments WHERE discussion_id = ? ORDER BY created_at ASC';
    const results = await db.query(sql, [id]);
    
    // 格式化结果
    const formattedComments = results.map(item => ({
      id: item.id,
      user: {
        name: item.user_name,
        avatar: item.user_avatar
      },
      content: item.content,
      time: item.created_at
    }));
    
    res.json(formattedComments);
  } catch (error) {
    console.error('获取讨论评论错误:', error);
    res.status(500).json({ error: '获取讨论评论失败' });
  }
});

// API 接口 - 添加评论
app.post('/api/discussions/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName, userAvatar, content } = req.body;
    
    if (!userId || !userName || !userAvatar || !content) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 插入评论
    const insertSql = 'INSERT INTO discussion_comments (discussion_id, user_id, user_name, user_avatar, content) VALUES (?, ?, ?, ?, ?)';
    await db.query(insertSql, [id, userId, userName, userAvatar, content]);
    
    // 更新讨论的评论数
    await db.query('UPDATE discussions SET comments = comments + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, message: '评论成功' });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ error: '添加评论失败' });
  }
});

// API 接口 - 点赞讨论
app.post('/api/discussions/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 更新点赞数
    await db.query('UPDATE discussions SET likes = likes + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, message: '点赞成功' });
  } catch (error) {
    console.error('点赞讨论错误:', error);
    res.status(500).json({ error: '点赞失败' });
  }
});

// API 接口 - 取消点赞
app.post('/api/discussions/:id/unlike', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 更新点赞数（确保不小于0）
    await db.query('UPDATE discussions SET likes = GREATEST(0, likes - 1) WHERE id = ?', [id]);
    
    res.json({ success: true, message: '取消点赞成功' });
  } catch (error) {
    console.error('取消点赞错误:', error);
    res.status(500).json({ error: '取消点赞失败' });
  }
});

// API 接口 - 编辑讨论
app.put('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tag, image, user_id } = req.body;
    
    // 验证必要参数
    if (!title || !content || !tag || !user_id) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 检查讨论是否存在且属于该用户
    const checkSql = 'SELECT * FROM discussions WHERE id = ? AND user_id = ?';
    const checkResult = await db.query(checkSql, [id, user_id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({ error: '讨论不存在或无权限编辑' });
    }
    
    // 更新讨论
    const updateSql = 'UPDATE discussions SET title = ?, content = ?, tag = ?, image = ?, updated_at = NOW() WHERE id = ?';
    await db.query(updateSql, [title, content, tag, image || null, id]);
    
    // 获取更新后的讨论
    const getSql = 'SELECT * FROM discussions WHERE id = ?';
    const updatedDiscussion = await db.query(getSql, [id]);
    
    // 格式化结果
    const formattedDiscussion = {
      id: updatedDiscussion[0].id,
      title: updatedDiscussion[0].title,
      content: updatedDiscussion[0].content,
      tag: updatedDiscussion[0].tag,
      image: updatedDiscussion[0].image,
      time: updatedDiscussion[0].created_at,
      user: {
        name: updatedDiscussion[0].user_name,
        avatar: updatedDiscussion[0].user_avatar
      },
      likes: updatedDiscussion[0].likes,
      comments: updatedDiscussion[0].comments,
      views: updatedDiscussion[0].views
    };
    
    res.json({ success: true, data: formattedDiscussion });
  } catch (error) {
    console.error('编辑讨论错误:', error);
    res.status(500).json({ error: '编辑讨论失败' });
  }
});

// API 接口 - 删除讨论
app.delete('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: '缺少用户ID' });
    }
    
    // 检查讨论是否存在且属于该用户
    const checkSql = 'SELECT * FROM discussions WHERE id = ? AND user_id = ?';
    const checkResult = await db.query(checkSql, [id, user_id]);
    
    if (checkResult.length === 0) {
      return res.status(404).json({ error: '讨论不存在或无权限删除' });
    }
    
    // 删除讨论
    await db.query('DELETE FROM discussions WHERE id = ?', [id]);
    
    res.json({ success: true, message: '讨论删除成功' });
  } catch (error) {
    console.error('删除讨论错误:', error);
    res.status(500).json({ error: '删除讨论失败' });
  }
});

// API 接口 - 点赞/取消点赞
app.post('/api/like', async (req, res) => {
  try {
    const { userId, contentId, contentType, isLiked } = req.body;
    
    if (!userId || !contentId || !contentType) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 检查是否已存在点赞记录
    const checkSql = 'SELECT id FROM likes WHERE user_id = ? AND content_id = ? AND content_type = ?';
    const existingLike = await db.query(checkSql, [userId, contentId, contentType]);
    
    if (isLiked) {
      // 添加点赞
      if (existingLike.length === 0) {
        const sql = 'INSERT INTO likes (user_id, content_id, content_type) VALUES (?, ?, ?)';
        await db.query(sql, [userId, contentId, contentType]);
        
        // 更新对应内容的点赞数
        const updateSql = 'UPDATE ?? SET likes = likes + 1 WHERE id = ?';
        await db.query(updateSql, [contentType === 'strategy' ? 'strategies' : contentType === 'scenic' ? 'scenics' : 'history', contentId]);
      }
    } else {
      // 取消点赞
      if (existingLike.length > 0) {
        const sql = 'DELETE FROM likes WHERE id = ?';
        await db.query(sql, [existingLike[0].id]);
        
        // 更新对应内容的点赞数
        const updateSql = 'UPDATE ?? SET likes = GREATEST(0, likes - 1) WHERE id = ?';
        await db.query(updateSql, [contentType === 'strategy' ? 'strategies' : contentType === 'scenic' ? 'scenics' : 'history', contentId]);
      }
    }
    
    res.json({ success: true, isLiked });
  } catch (error) {
    console.error('点赞操作错误:', error);
    res.status(500).json({ error: '点赞操作失败' });
  }
});

// API 接口 - 检查用户是否点赞
app.get('/api/like/check', async (req, res) => {
  try {
    const { userId, contentId, contentType } = req.query;
    
    if (!userId || !contentId || !contentType) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const sql = 'SELECT id FROM likes WHERE user_id = ? AND content_id = ? AND content_type = ?';
    const result = await db.query(sql, [userId, contentId, contentType]);
    
    res.json({ isLiked: result.length > 0 });
  } catch (error) {
    console.error('检查点赞状态错误:', error);
    res.status(500).json({ error: '检查点赞状态失败' });
  }
});

// API 接口 - 微信登录
app.post('/api/login/wechat', async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少code参数' });
    }
    
    // 模拟微信登录验证
    // 实际项目中，这里应该调用微信官方API验证code并获取openid
    console.log('微信登录code:', code);
    
    // 生成mock openid
    const openid = 'openid_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // 检查用户是否存在
    let user;
    const checkSql = 'SELECT * FROM users WHERE openid = ?';
    const checkResult = await db.query(checkSql, [openid]);
    
    if (checkResult.length > 0) {
      // 用户已存在，更新信息
      user = checkResult[0];
      if (userInfo) {
        const updateSql = 'UPDATE users SET nickname = ?, avatar_url = ?, city = ?, gender = ? WHERE openid = ?';
        await db.query(updateSql, [userInfo.nickName, userInfo.avatarUrl, userInfo.city, userInfo.gender, openid]);
        user = {
          ...user,
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          city: userInfo.city,
          gender: userInfo.gender
        };
      }
    } else {
      // 用户不存在，创建新用户
      const insertSql = 'INSERT INTO users (openid, nickname, avatar_url, city, gender) VALUES (?, ?, ?, ?, ?)';
      const insertResult = await db.query(insertSql, [
        openid,
        userInfo?.nickName || '微信用户',
        userInfo?.avatarUrl || 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJLcib4VJj1ibk5e0EiaTia4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4iaibM9kZ9YHfCib4/132',
        userInfo?.city || '未知',
        userInfo?.gender || 0
      ]);
      
      // 获取新创建的用户
      const newUserSql = 'SELECT * FROM users WHERE id = ?';
      const newUserResult = await db.query(newUserSql, [insertResult.insertId]);
      user = newUserResult[0];
    }
    
    // 生成token
    const token = 'token_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // 构建返回的用户信息
    const returnUserInfo = {
      id: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
      city: user.city,
      gender: user.gender
    };
    
    res.json({ success: true, data: { userInfo: returnUserInfo, token: token } });
  } catch (error) {
    logger.error('微信登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// API 接口 - 上传头像
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    
    if (!userId || !file) {
      return res.status(400).json({ error: '缺少用户ID或文件' });
    }
    
    // 构建头像URL
    const avatarUrl = `http://localhost:3001/uploads/${file.filename}`;
    
    // 更新用户头像URL到数据库
    const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
    await db.query(sql, [avatarUrl, userId]);
    
    res.json({ success: true, data: { avatarUrl: avatarUrl } });
  } catch (error) {
    logger.error('上传头像错误:', error);
    res.status(500).json({ error: '上传头像失败' });
  }
});

// API 接口 - 上传头像（base64编码）
app.post('/api/upload/avatar-base64', async (req, res) => {
  try {
    const { userId, avatarData, fileName } = req.body;
    
    if (!userId || !avatarData) {
      return res.status(400).json({ error: '缺少用户ID或头像数据' });
    }
    
    // 生成文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(fileName) || '.jpg';
    const newFileName = `avatar-${userId}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, newFileName);
    
    // 解码base64数据并保存文件
    const buffer = Buffer.from(avatarData, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // 构建头像URL
    const avatarUrl = `http://localhost:3001/uploads/${newFileName}`;
    
    // 更新用户头像URL到数据库
    const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
    await db.query(sql, [avatarUrl, userId]);
    
    res.json({ success: true, data: { avatarUrl: avatarUrl } });
  } catch (error) {
    logger.error('上传头像（base64）错误:', error);
    res.status(500).json({ error: '上传头像失败' });
  }
});

// API 接口 - 更新用户信息
app.post('/api/users/update', async (req, res) => {
  try {
    const { userId, nickname, city } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少用户ID' });
    }
    
    // 构建更新字段
    const updateFields = [];
    const updateValues = [];
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }
    
    // 添加用户ID到值数组
    updateValues.push(userId);
    
    // 构建SQL语句
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    // 执行更新
    await db.query(sql, updateValues);
    
    // 获取更新后的用户信息
    const getUserSql = 'SELECT id, nickname, avatar_url as avatarUrl, city, gender FROM users WHERE id = ?';
    const userResult = await db.query(getUserSql, [userId]);
    
    if (userResult.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ success: true, data: { userInfo: userResult[0] } });
  } catch (error) {
    logger.error('更新用户信息错误:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}`);
});