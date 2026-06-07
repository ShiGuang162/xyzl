# API增强功能使用说明

## 概述

为了提升用户体验和应用性能，我们增强了API工具类，增加了缓存和错误处理功能。

## 新增功能

### 1. 数据缓存
- GET请求的结果会被自动缓存
- 缓存有效期为5分钟
- 最大缓存条目数为100条
- 当网络请求失败时，会自动使用缓存数据

### 2. 错误处理
- 改进了错误处理机制
- 网络请求失败时有更友好的错误提示
- 自动降级到缓存数据

### 3. 使用方法

如果需要使用增强版API功能，可以在页面中引入：

```javascript
// 使用增强版API（带缓存和错误处理）
const api = require('../../utils/api-enhanced');

Page({
  onLoad: function() {
    // 正常调用API
    api.getStrategies().then(data => {
      console.log('获取攻略数据:', data);
    }).catch(error => {
      console.error('获取数据失败:', error);
    });
  }
});
```

### 4. 缓存管理

增强版API还提供了一些缓存管理方法：

```javascript
// 清理所有缓存
api.clearCache();

// 获取缓存信息
const cacheInfo = api.getCacheInfo();
console.log('缓存大小:', cacheInfo.size);
```

## 注意事项

- 缓存只适用于GET请求
- POST、PUT、DELETE等修改数据的请求不会被缓存
- 缓存数据在有效期内不会重复请求
- 网络异常时会自动使用缓存数据（仅GET请求）