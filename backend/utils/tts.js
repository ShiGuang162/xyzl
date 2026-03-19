const fs = require('fs');
const path = require('path');

// 支持的方言配置
const dialects = {
  '普通话': {
    per: 0, // 百度语音的发音人ID
    spd: 5, // 语速
    pit: 5, // 语调
    vol: 5  // 音量
  },
  '北京话': {
    per: 1, // 不同的发音人ID
    spd: 5,
    pit: 5,
    vol: 5
  },
  '上海话': {
    per: 2,
    spd: 5,
    pit: 5,
    vol: 5
  },
  '广东话': {
    per: 3,
    spd: 5,
    pit: 5,
    vol: 5
  },
  '四川话': {
    per: 4,
    spd: 5,
    pit: 5,
    vol: 5
  },
  '东北话': {
    per: 5,
    spd: 5,
    pit: 5,
    vol: 5
  }
};

// 生成语音文件（模拟实现）
async function generateSpeech(text, dialect, id, type) {
  try {
    // 确保音频目录存在
    const audioDir = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // 生成文件名
    const filename = `${type}_${id}_${dialect.replace(/\s+/g, '_')}.mp3`;
    const filePath = path.join(audioDir, filename);
    
    // 创建一个简单的MP3文件（模拟）
    // 这里我们创建一个空的MP3文件，实际项目中需要使用真实的TTS服务
    fs.writeFileSync(filePath, Buffer.from([]));
    
    // 模拟延迟，模拟真实的API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回相对路径
    return `/uploads/audio/${filename}`;
  } catch (error) {
    console.error('语音合成错误:', error);
    return null;
  }
}

// 检查语音文件是否存在
function checkSpeechFile(id, dialect, type) {
  const filename = `${type}_${id}_${dialect.replace(/\s+/g, '_')}.mp3`;
  const filePath = path.join(__dirname, '../uploads/audio', filename);
  return fs.existsSync(filePath);
}

// 获取语音文件路径
function getSpeechFilePath(id, dialect, type) {
  const filename = `${type}_${id}_${dialect.replace(/\s+/g, '_')}.mp3`;
  return `/uploads/audio/${filename}`;
}

module.exports = {
  generateSpeech,
  checkSpeechFile,
  getSpeechFilePath,
  dialects
};