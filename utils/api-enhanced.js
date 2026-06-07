// 增强版API工具，包含缓存和错误处理
const baseURL = 'http://localhost:3001/api';

// 缓存配置
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5分钟缓存有效期
  maxSize: 100 // 最大缓存条目数
};

// 缓存对象
let cache = {};

// 清理过期缓存
function cleanupCache() {
  const now = Date.now();
  for (const key in cache) {
    if (now - cache[key].timestamp > CACHE_CONFIG.TTL) {
      delete cache[key];
    }
  }
}

// 生成缓存键
function generateCacheKey(url, method, data) {
  return `${method}_${url}_${JSON.stringify(data || {})}`;
}

// 从缓存获取数据
function getFromCache(key) {
  if (cache[key] && (Date.now() - cache[key].timestamp < CACHE_CONFIG.TTL)) {
    return cache[key].data;
  }
  return null;
}

// 设置缓存
function setToCache(key, data) {
  // 清理过期缓存
  cleanupCache();
  
  // 如果缓存超出大小限制，删除最早的数据
  const keys = Object.keys(cache);
  if (keys.length >= CACHE_CONFIG.maxSize) {
    // 按时间戳排序，删除最早的条目
    keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
    delete cache[keys[0]];
  }
  
  cache[key] = {
    data: data,
    timestamp: Date.now()
  };
}

// 封装请求方法
function request(url, method, data) {
  return new Promise((resolve, reject) => {
    // 生成缓存键
    const cacheKey = generateCacheKey(url, method, data);
    
    // 尝试从缓存获取数据（仅GET请求）
    if (method === 'GET') {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log('从缓存获取数据:', url);
        resolve(cachedData);
        return;
      }
    }
    
    // 真实网络请求
    wx.request({
      url: baseURL + url,
      method: method || 'GET',
      data: data || {},
      header: {
        'Content-Type': 'application/json'
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 只缓存GET请求的结果
          if (method === 'GET') {
            setToCache(cacheKey, res.data);
          }
          resolve(res.data);
        } else {
          console.error('请求失败:', res.statusCode, res.data);
          reject(res);
        }
      },
      fail: err => {
        console.error('网络请求失败:', err);
        
        // 如果是GET请求，尝试从缓存获取数据
        if (method === 'GET') {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            console.warn('网络请求失败，使用缓存数据:', url);
            resolve(cachedData);
            return;
          }
        }
        
        reject(err);
      }
    });
  });
}

// 导出API方法
module.exports = {
  // 攻略相关API
  getStrategies: (params = {}) => request('/strategies', 'GET', params),
  getStrategyById: (id) => request(`/strategies/${id}`, 'GET'),
  createStrategy: (data) => request('/strategies', 'POST', data),
  updateStrategy: (id, data) => request(`/strategies/${id}`, 'PUT', data),
  deleteStrategy: (id) => request(`/strategies/${id}`, 'DELETE'),

  // 景点相关API
  getScenics: (params = {}) => request('/scenics', 'GET', params),
  getScenicById: (id) => request(`/scenics/${id}`, 'GET'),
  createScenic: (data) => request('/scenics', 'POST', data),
  updateScenic: (id, data) => request(`/scenics/${id}`, 'PUT', data),
  deleteScenic: (id) => request(`/scenics/${id}`, 'DELETE'),

  // 历史文化相关API
  getHistory: (params = {}) => request('/history', 'GET', params),
  getHistoryById: (id) => request(`/history/${id}`, 'GET'),
  createHistory: (data) => request('/history', 'POST', data),
  updateHistory: (id, data) => request(`/history/${id}`, 'PUT', data),
  deleteHistory: (id) => request(`/history/${id}`, 'DELETE'),

  // 收藏相关API
  getCollections: (userId) => request('/collections', 'GET', { userId }),
  addCollection: (data) => request('/collections', 'POST', data),
  removeCollection: (id) => request(`/collections/${id}`, 'DELETE'),

  // 评论相关API
  getComments: (itemId, itemType) => request('/comments', 'GET', { itemId, itemType }),
  addComment: (data) => request('/comments', 'POST', data),

  // 搜索API
  search: (keyword) => {
    return request('/search', 'GET', { keyword });
  },

  // 健康检查API
  healthCheck: () => request('/health', 'GET'),
  
  // 清理缓存
  clearCache: () => {
    cache = {};
  },
  
  // 获取缓存信息
  getCacheInfo: () => {
    return {
      size: Object.keys(cache).length,
      keys: Object.keys(cache)
    };
  }
};