// 日志工具模块

// 日志级别
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

// 获取当前时间戳
function getTimestamp() {
  return new Date().toISOString();
}

// 基础日志方法
function log(level, message, data = null) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

// 信息日志
function info(message, data = null) {
  log(LOG_LEVELS.INFO, message, data);
}

// 警告日志
function warn(message, data = null) {
  log(LOG_LEVELS.WARN, message, data);
}

// 错误日志
function error(message, error = null) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${LOG_LEVELS.ERROR}] ${message}`;
  
  if (error) {
    console.error(logMessage);
    if (error.stack) {
      console.error(error.stack);
    } else {
      console.error(error);
    }
  } else {
    console.error(logMessage);
  }
}

// 调试日志
function debug(message, data = null) {
  if (process.env.NODE_ENV !== 'production') {
    log(LOG_LEVELS.DEBUG, message, data);
  }
}

// 请求日志中间件
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    if (statusCode >= 400) {
      warn(`Request ${method} ${url} ${statusCode} ${duration}ms from ${ip}`);
    } else {
      debug(`Request ${method} ${url} ${statusCode} ${duration}ms from ${ip}`);
    }
  });
  
  next();
}

module.exports = {
  info,
  warn,
  error,
  debug,
  requestLogger
};