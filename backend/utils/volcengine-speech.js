const crypto = require('crypto');
const https = require('https');
const config = require('../config/volcengine');

// 生成签名
function generateSignature(method, path, headers, body) {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 15);
  
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key}:${headers[key]}`)
    .join('\n');
  
  const signedHeaders = Object.keys(headers).sort().join(';');
  
  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    '',
    signedHeaders,
    crypto.createHash('sha256').update(body).digest('hex')
  ].join('\n');
  
  const credentialScope = `${timestamp.substring(0, 8)}/${config.region}/${config.service}/request`;
  
  const stringToSign = [
    'HMAC-SHA256',
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  const signingKey = crypto.createHmac('sha256', crypto.createHmac('sha256', 'VOLCENGINE' + config.secretKey).update(timestamp.substring(0, 8)).digest()).update(config.region).digest();
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  return {
    timestamp,
    nonce,
    signature,
    credentialScope,
    signedHeaders
  };
}

// 语音合成 API
async function textToSpeech(text, options = {}) {
  const params = {
    Text: text,
    Speaker: options.speaker || 'zh_female_vv_jupiter_bigtts',
    AudioFormat: options.format || 'mp3',
    SampleRate: options.sampleRate || 24000,
    Speed: options.speed || 1.0,
    Volume: options.volume || 1.0,
    Pitch: options.pitch || 1.0
  };
  
  const body = JSON.stringify(params);
  const path = '/api/v2/tts/speech-synthesis';
  const headers = {
    'Content-Type': 'application/json',
    'Host': 'speech.volcengineapi.com',
    'X-Top-Request-Id': crypto.randomBytes(16).toString('hex'),
    'X-Top-Service': config.service,
    'X-Top-Region': config.region
  };
  
  const { timestamp, nonce, signature, signedHeaders } = generateSignature('POST', path, headers, body);
  
  headers['X-Top-Timestamp'] = timestamp;
  headers['X-Top-Nonce'] = nonce;
  headers['X-Top-Access-Key'] = config.accessKey;
  headers['X-Top-SignedHeaders'] = signedHeaders;
  headers['X-Top-Signature'] = signature;
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'speech.volcengineapi.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ResponseMetadata && result.ResponseMetadata.Error) {
            reject(new Error(result.ResponseMetadata.Error.Message));
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(body);
    req.end();
  });
}

// 方言映射
const dialectMap = {
  '普通话': 'zh_female_vv_jupiter_bigtts',
  '北京话': 'zh_male_beijing_1_tts',
  '上海话': 'zh_female_shanghai_1_tts',
  '广东话': 'zh_female_cantonese_1_tts',
  '四川话': 'zh_male_sichuan_1_tts',
  '东北话': 'zh_male_northeast_1_tts'
};

// 获取方言对应的音色
function getDialectSpeaker(dialect) {
  return dialectMap[dialect] || 'zh_female_vv_jupiter_bigtts';
}

module.exports = {
  textToSpeech,
  getDialectSpeaker
};
