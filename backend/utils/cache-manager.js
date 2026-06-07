const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '../audio-cache');

// 生成缓存键
function generateCacheKey(text, options) {
  const keyData = {
    text,
    ...options
  };
  return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
}

// 检查缓存是否存在
function checkCache(key) {
  const cachePath = path.join(CACHE_DIR, `${key}.mp3`);
  return fs.existsSync(cachePath);
}

// 获取缓存文件路径
function getCachePath(key) {
  return path.join(CACHE_DIR, `${key}.mp3`);
}

// 保存到缓存
function saveToCache(key, audioData) {
  const cachePath = getCachePath(key);
  fs.writeFileSync(cachePath, Buffer.from(audioData, 'base64'));
  return cachePath;
}

// 从缓存读取
function readFromCache(key) {
  const cachePath = getCachePath(key);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'base64');
  }
  return null;
}

// 清理过期缓存（可选）
function cleanExpiredCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
  const now = Date.now();
  fs.readdirSync(CACHE_DIR).forEach(file => {
    const filePath = path.join(CACHE_DIR, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}

module.exports = {
  generateCacheKey,
  checkCache,
  getCachePath,
  saveToCache,
  readFromCache,
  cleanExpiredCache
};
