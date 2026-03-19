// 环境配置
const config = {
  development: {
    baseURL: 'http://localhost:3001/api'
  },
  production: {
    baseURL: 'https://your-domain.com/api'
  }
};

// 当前环境
const ENV = 'development'; // 部署上线时改为 'production'

module.exports = config[ENV];
