# 微信小程序部署指南

本指南将帮助您将微信小程序项目部署到生产环境，使用自己的服务器和域名。

## 部署架构

```
用户 → 微信小程序 → Nginx (80/443端口) → Node.js后端 (3001端口) → MySQL数据库
```

## 前提条件

1. **服务器要求**：
   - Linux 服务器（推荐 Ubuntu 20.04+ 或 CentOS 7+）
   - 至少 2GB 内存
   - 20GB 磁盘空间
   - 公网 IP 地址

2. **域名和证书**：
   - 已备案的域名（国内服务器需要）
   - SSL 证书（可使用 Let's Encrypt 免费证书）

3. **微信小程序配置**：
   - 微信小程序 AppID
   - 服务器域名已在微信公众平台配置

## 步骤 1: 服务器准备

### 1.1 安装 Docker 和 Docker Compose

```bash
# Ubuntu/Debian
apt update
apt install -y docker.io docker-compose

# CentOS
yum install -y docker docker-compose

# 启动 Docker
systemctl start docker
systemctl enable docker
```

### 1.2 配置域名解析

将您的域名解析到服务器 IP 地址：
- 记录类型：A
- 主机记录：@ 或 api
- 记录值：您的服务器 IP

## 步骤 2: 上传项目代码

### 2.1 在本地打包项目

```bash
# 进入项目目录
cd /Users/shiguang/Desktop/xyzl

# 压缩项目（排除不需要的文件）
zip -r xyzl-deploy.zip . -x "node_modules/*" ".git/*" ".DS_Store"
```

### 2.2 上传到服务器

```bash
# 使用 SCP 上传
scp xyzl-deploy.zip root@your-server-ip:/opt/

# 登录服务器
ssh root@your-server-ip

# 解压
cd /opt/
unzip xyzl-deploy.zip -d xyzl/
cd xyzl
```

## 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
# 创建环境变量文件
cat > .env << EOF
# 数据库配置
DB_USER=root
DB_PASSWORD=YourStrongPassword123
DB_NAME=xyzl_db

# 后端配置
PORT=3001
NODE_ENV=production
EOF
```

**注意**：请将 `YourStrongPassword123` 替换为强密码。

## 步骤 4: 配置 Nginx

### 4.1 修改 nginx.conf

编辑 `nginx.conf` 文件，将 `your-domain.com` 替换为您的实际域名：

```bash
sed -i 's/your-domain.com/api.yourdomain.com/g' nginx.conf
```

### 4.2 配置 SSL 证书（可选但推荐）

使用 Let's Encrypt 获取免费 SSL 证书：

```bash
# 安装 Certbot
apt install -y certbot

# 获取证书
certbot certonly --standalone -d api.yourdomain.com

# 创建 SSL 目录
mkdir -p ssl

# 复制证书
cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem ssl/
```

### 4.3 更新 nginx.conf 支持 HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # ... 其他配置保持不变
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 步骤 5: 启动服务

### 5.1 构建并启动

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 5.2 初始化数据库

```bash
# 进入 MySQL 容器
docker exec -it xyzl-mysql mysql -u root -p

# 在 MySQL 中执行
USE xyzl_db;
SHOW TABLES;
```

## 步骤 6: 配置微信小程序

### 6.1 登录微信公众平台

访问 [微信公众平台](https://mp.weixin.qq.com/)，登录您的小程序账号。

### 6.2 配置服务器域名

进入「开发」→「开发管理」→「开发设置」→「服务器域名」：

**request 合法域名**：
```
https://api.yourdomain.com
```

**uploadFile 合法域名**（如果有上传功能）：
```
https://api.yourdomain.com
```

**downloadFile 合法域名**（如果有下载功能）：
```
https://api.yourdomain.com
```

### 6.3 配置业务域名（可选）

如果需要使用 web-view 组件，需要配置业务域名。

## 步骤 7: 修改小程序前端代码

### 7.1 更新 API 基础地址

在小程序代码中，将 API 地址修改为您的域名：

```javascript
// utils/api.js 或 app.js
const API_BASE_URL = 'https://api.yourdomain.com';
```

### 7.2 检查所有接口调用

确保所有接口调用都使用完整的 URL：

```javascript
// 正确
wx.request({
  url: 'https://api.yourdomain.com/api/scenics',
  // ...
});

// 错误（使用 localhost）
wx.request({
  url: 'http://localhost:3001/api/scenics',
  // ...
});
```

## 步骤 8: 上传小程序代码

### 8.1 在微信开发者工具中

1. 点击「上传」按钮
2. 填写版本号和项目备注
3. 等待上传完成

### 8.2 在公众平台提交审核

1. 登录微信公众平台
2. 进入「版本管理」
3. 找到刚才上传的版本，点击「提交审核」
4. 填写审核信息，提交审核

### 8.3 审核通过后发布

审核通过后，点击「发布」即可上线。

## 常见问题排查

### 1. 服务启动失败

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs mysql
docker-compose logs nginx
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 是否运行
docker ps | grep mysql

# 进入 MySQL 容器检查
docker exec -it xyzl-mysql mysql -u root -p
```

### 3. 接口访问 502 错误

```bash
# 检查后端服务是否运行
docker ps | grep backend

# 查看后端日志
docker logs xyzl-backend
```

### 4. 小程序无法访问接口

- 检查域名是否已配置在微信公众平台
- 确认使用 HTTPS 协议
- 检查 SSL 证书是否有效

### 5. 跨域问题

已在 `nginx.conf` 中配置 CORS，如果仍有问题，检查：
- Nginx 配置是否生效：`docker exec xyzl-nginx nginx -t`
- 重启 Nginx：`docker-compose restart nginx`

## 维护命令

```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新代码后重新构建
docker-compose down
docker-compose up -d --build

# 备份数据库
docker exec xyzl-mysql mysqldump -u root -p xyzl_db > backup.sql

# 恢复数据库
docker exec -i xyzl-mysql mysql -u root -p xyzl_db < backup.sql
```

## 安全建议

1. **修改默认密码**：不要使用默认的数据库密码
2. **定期更新**：定期更新 Docker 镜像和系统补丁
3. **防火墙配置**：只开放必要的端口（80、443、22）
4. **日志监控**：定期检查日志文件，发现异常及时处理
5. **SSL 证书**：使用 HTTPS，定期更新 SSL 证书

## 性能优化

1. **启用 Gzip**：已在 Nginx 配置中启用
2. **数据库优化**：根据实际数据量调整 MySQL 配置
3. **缓存策略**：对静态资源启用浏览器缓存
4. **CDN 加速**：如果用户分布广泛，可以考虑使用 CDN

---

**部署完成！** 您的小程序现在应该可以通过自己的服务器正常运行了。

如有问题，请检查日志或参考常见问题排查部分。
