// 后端API地址
const baseURL = 'http://localhost:3001/api';

// 封装请求方法
function request(url, method, data) {
  return new Promise((resolve, reject) => {
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
          resolve(res.data);
        } else {
          console.error('请求失败:', res.statusCode, res.data);
          reject(res);
        }
      },
      fail: err => {
        console.error('网络请求失败:', err);
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
  healthCheck: () => request('/health', 'GET')
};