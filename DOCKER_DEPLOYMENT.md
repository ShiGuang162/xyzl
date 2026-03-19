# Docker 部署指南

本指南将帮助您使用 Docker Compose 将项目部署到云端服务器。

## 前提条件

在开始部署之前，确保您的云端服务器满足以下要求：

- 服务器已安装 Docker 和 Docker Compose
- 服务器有公网 IP 地址
- 服务器开放了必要的端口（3001、3306）
- 域名已解析到服务器 IP（如果需要）

## 步骤 1: 安装 Docker 和 Docker Compose

### Ubuntu/Debian 系统

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
apt install -y docker.io

# 安装 Docker Compose
apt install -y docker-compose

# 启动 Docker 服务
systemctl start docker
systemctl enable docker
```

### CentOS/RHEL 系统

```bash
# 安装 Docker
yum install -y docker

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## 步骤 2: 上传项目代码

使用 SCP 或其他方式将项目代码上传到服务器：

```bash
# 从本地上传到服务器
scp -r /path/to/xyzl user@server_ip:/path/to/destination

# 例如
scp -r ./xyzl root@192.168.1.100:/opt/
```

## 步骤 3: 配置环境变量

进入项目目录并创建 `.env` 文件：

```bash
cd /path/to/xyzl

# 创建环境变量文件
touch .env

# 编辑环境变量文件
nano .env
```

在 `.env` 文件中添加以下内容：

```env
# 数据库配置
DB_USER=root
DB_PASSWORD=Mysql@123456
DB_NAME=xyzl_db

# 后端配置
PORT=3001
NODE_ENV=production
```

## 步骤 4: 启动服务

使用 Docker Compose 启动服务：

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 步骤 5: 验证部署

### 检查服务状态

```bash
# 查看所有容器状态
docker ps

# 检查后端服务日志
docker logs xyzl-backend

# 检查数据库服务日志
docker logs xyzl-mysql
```

### 测试 API 端点

```bash
# 测试健康检查端点
curl http://localhost:3001/health

# 测试其他 API 端点
curl http://localhost:3001/api/some-endpoint
```

## 步骤 6: 配置 Nginx 反向代理（可选）

如果您需要使用域名访问服务，可以配置 Nginx 作为反向代理：

```bash
# 安装 Nginx
apt install -y nginx

# 创建 Nginx 配置文件
nano /etc/nginx/sites-available/xyzl
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置并重启 Nginx：

```bash
# 启用配置
ln -s /etc/nginx/sites-available/xyzl /etc/nginx/sites-enabled/

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

## 步骤 7: 配置 SSL 证书（可选）

使用 Let's Encrypt 获取免费的 SSL 证书：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 自动更新证书
certbot renew --dry-run
```

## 常见问题排查

### 1. 服务启动失败

```bash
# 查看详细日志
docker-compose logs

# 检查容器状态
docker-compose ps
```

### 2. 数据库连接问题

```bash
# 进入数据库容器
docker exec -it xyzl-mysql mysql -u root -p

# 检查数据库是否存在
SHOW DATABASES;

# 检查表结构
USE xyzl_db;
SHOW TABLES;
```

### 3. 端口访问问题

```bash
# 检查端口是否开放
netstat -tuln

# 检查防火墙设置
ufw status

# 开放端口
ufw allow 3001
ufw allow 80
ufw allow 443
```

## 管理命令

### 停止服务

```bash
docker-compose down
```

### 重启服务

```bash
docker-compose restart
```

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
docker-compose logs -f
```

### 构建镜像

```bash
docker-compose build
```

## 部署完成

项目已成功部署到云端服务器！您可以通过以下方式访问：

- 直接访问：`http://服务器IP:3001`
- 通过域名：`http://your-domain.com`（如果配置了 Nginx）
- 通过 HTTPS：`https://your-domain.com`（如果配置了 SSL）

---

**注意**：本部署方案使用了容器化技术，确保了环境的一致性和部署的便捷性。如果您需要进一步的优化或有任何问题，请参考 `DEPLOYMENT.md` 文件中的详细说明。