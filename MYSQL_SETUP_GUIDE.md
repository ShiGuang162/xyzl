# 乡音智旅 - MySQL数据库配置指南

## 概述

本项目已重构为使用MySQL数据库存储后端数据。以下是配置和部署说明。

## 数据库配置

### 1. 环境变量配置

在 `/backend/.env` 文件中配置数据库连接信息：

```env
DB_HOST=localhost              # 数据库主机地址
DB_USER=root                   # 数据库用户名
DB_PASSWORD=your_password      # 数据库密码（如果有的话）
DB_NAME=xyzl_db               # 数据库名称
DB_PORT=3306                  # 数据库端口
PORT=3001                     # 后端服务端口
```

### 2. 数据库表结构

系统自动创建以下数据表：

- `strategies`: 攻略表
- `scenics`: 景点表  
- `history`: 历史文化表
- `users`: 用户表
- `collections`: 收藏表
- `comments`: 评论表

## 部署步骤

### 1. 安装MySQL

如果您还没有安装MySQL，请按以下方式安装：

#### macOS
```bash
# 使用Homebrew
brew install mysql

# 启动MySQL服务
brew services start mysql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Windows
从 [MySQL官网](https://dev.mysql.com/downloads/mysql/) 下载安装包进行安装。

### 2. 初始化数据库

运行初始化脚本创建数据库和表结构：

```bash
cd backend
node init-db.js
```

### 3. 配置数据库用户权限

首次使用需要创建数据库用户并授权（在MySQL命令行中执行）：

```sql
-- 登录MySQL（使用root账户）
mysql -u root -p

-- 创建数据库
CREATE DATABASE xyzl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权（如果使用自定义用户）
CREATE USER 'xyzl_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON xyzl_db.* TO 'xyzl_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 启动后端服务

```bash
cd backend
npm install
npm start
```

## API接口变更

重构后的API接口提供了完整的CRUD操作：

### 攻略相关
- `GET /api/strategies` - 获取攻略列表（支持分页）
- `GET /api/strategies/:id` - 获取单个攻略
- `POST /api/strategies` - 创建攻略
- `PUT /api/strategies/:id` - 更新攻略
- `DELETE /api/strategies/:id` - 删除攻略

### 景点相关
- `GET /api/scenics` - 获取景点列表（支持分页）
- `GET /api/scenics/:id` - 获取单个景点
- `POST /api/scenics` - 创建景点
- `PUT /api/scenics/:id` - 更新景点
- `DELETE /api/scenics/:id` - 删除景点

### 历史文化相关
- `GET /api/history` - 获取历史文化列表（支持分页）
- `GET /api/history/:id` - 获取单个历史文化记录
- `POST /api/history` - 创建历史文化记录
- `PUT /api/history/:id` - 更新历史文化记录
- `DELETE /api/history/:id` - 删除历史文化记录

### 收藏与评论
- `GET /api/collections?userId=:userId` - 获取用户收藏
- `POST /api/collections` - 添加收藏
- `DELETE /api/collections/:id` - 删除收藏
- `GET /api/comments?itemId=:itemId&itemType=:itemType` - 获取评论
- `POST /api/comments` - 添加评论

## 错误处理

- 数据库连接失败时，服务仍会启动，但数据功能不可用
- 所有数据库操作都有适当的错误处理和日志记录
- API响应格式统一，包含错误信息

## 性能优化

- 使用连接池管理数据库连接
- 查询语句使用索引优化
- 支持分页查询大数据集
- 使用预处理语句防止SQL注入

## 安全注意事项

- 所有用户输入都经过验证和清理
- 使用参数化查询防止SQL注入
- 敏感信息通过环境变量配置
- 实施适当的访问控制

## 故障排除

### 数据库连接问题
1. 检查MySQL服务是否运行
2. 验证数据库凭证是否正确
3. 确认防火墙设置允许相应端口访问

### 表结构问题
运行 `init-db.js` 脚本重新创建表结构。

### 权限问题
确认数据库用户具有对 `xyzl_db` 数据库的完整权限。