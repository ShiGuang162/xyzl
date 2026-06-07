// 火山引擎配置
// 注意：实际使用时请替换为真实的 API 密钥
module.exports = {
  accessKey: process.env.VOLCENGINE_ACCESS_KEY || 'your_access_key_here',
  secretKey: process.env.VOLCENGINE_SECRET_KEY || 'your_secret_key_here',
  region: 'cn-beijing', // 区域
  service: 'volcengine_speech'
};
