# 乡音智旅小程序部署指南

## 项目结构

```
xyzl/
├── backend/              # 后端服务
│   ├── app.js           # Express服务器
│   ├── package.json     # 后端依赖
│   ├── config/          # 配置文件
│   ├── utils/           # 工具函数
│   ├── uploads/         # 上传文件目录
│   └── Dockerfile       # Docker配置
├── pages/               # 小程序页面
├── utils/               # 小程序工具
├── app.json             # 小程序配置
├── package.json         # 根目录依赖
├── docker-compose.yml   # Docker Compose配置
└── DEPLOYMENT.md        # 本文件
```

## 云端服务器部署

### 前置准备

1. **购买云服务器**
   - 推荐配置：2核4GB以上，40GB SSD
   - 操作系统：Ubuntu 20.04/22.04 LTS 或 CentOS 7/8
   - 带宽：3Mbps以上

2. **购买域名**
   - 在阿里云、腾讯云等平台购买域名
   - 完成域名实名认证

3. **配置安全组/防火墙**
   - 开放端口：22 (SSH)、80 (HTTP)、443 (HTTPS)
   - 限制SSH访问IP（可选但推荐）

### 服务器初始化

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 更新系统
apt update && apt upgrade -y  # Ubuntu
# 或
yum update -y  # CentOS

# 3. 安装基本工具
apt install -y curl wget git vim ufw  # Ubuntu
# 或
yum install -y curl wget git vim firewalld  # CentOS

# 4. 创建普通用户（安全考虑）
adduser deploy
usermod -aG sudo deploy
```

### 方式一：使用Docker Compose部署（推荐）

#### 1. 安装Docker和Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

#### 2. 上传项目代码

```bash
# 在本地执行
# 方式1：使用Git（推荐）
git clone your-repo-url
cd xyzl

# 方式2：使用SCP上传
scp -r xyzl root@your-server-ip:/opt/
```

#### 3. 配置环境变量

```bash
cd /opt/xyzl

# 创建.env文件
cat > backend/.env << EOF
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=your_strong_password
DB_NAME=xyzl_db
DB_PORT=3306
PORT=3001
NODE_ENV=production
EOF
```

#### 4. 启动服务

```bash
# 首次启动（构建镜像）
docker-compose up -d --build

# 后续启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

#### 5. 初始化数据库（首次部署）

```bash
# 进入后端容器
docker-compose exec backend sh

# 初始化数据库
node init-db.js

# 退出容器
exit
```

### 方式二：传统部署（PM2 + Nginx）

#### 1. 安装Node.js

```bash
# 使用NVM安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 验证安装
node --version
npm --version
```

#### 2. 安装MySQL

```bash
# Ubuntu
apt install -y mysql-server

# CentOS
yum install -y mysql-server

# 启动MySQL
systemctl start mysql
systemctl enable mysql

# 安全配置
mysql_secure_installation
```

#### 3. 创建数据库和用户

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE xyzl_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户
CREATE USER 'xyzl_user'@'localhost' IDENTIFIED BY 'your_strong_password';

# 授权
GRANT ALL PRIVILEGES ON xyzl_db.* TO 'xyzl_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

#### 4. 部署后端代码

```bash
# 创建应用目录
mkdir -p /opt/xyzl
cd /opt/xyzl

# 上传代码（使用git或scp）
git clone your-repo-url .

# 安装依赖
cd backend
npm install --production

# 配置环境变量
cp .env.example .env
vim .env
```

#### 5. 初始化数据库

```bash
node init-db.js
```

#### 6. 使用PM2管理进程

```bash
# 全局安装PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name xyzl-backend

# 设置开机自启
pm2 startup
pm2 save

# 常用命令
pm2 status              # 查看状态
pm2 logs xyzl-backend   # 查看日志
pm2 restart xyzl-backend # 重启
pm2 stop xyzl-backend    # 停止
pm2 delete xyzl-backend  # 删除
```

### 配置Nginx反向代理

#### 1. 安装Nginx

```bash
# Ubuntu
apt install -y nginx

# CentOS
yum install -y nginx

# 启动Nginx
systemctl start nginx
systemctl enable nginx
```

#### 2. 配置Nginx

```bash
# 创建配置文件
vim /etc/nginx/sites-available/xyzl

# 或
vim /etc/nginx/conf.d/xyzl.conf
```

添加以下配置：

```nginx
upstream xyzl_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置（使用Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/xyzl_access.log;
    error_log /var/log/nginx/xyzl_error.log;

    # 客户端上传大小限制
    client_max_body_size 20M;

    # API代理
    location /api {
        proxy_pass http://xyzl_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件
    location /uploads {
        proxy_pass http://xyzl_backend;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. 启用配置

```bash
# Ubuntu/Debian
ln -s /etc/nginx/sites-available/xyzl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启Nginx
systemctl reload nginx
```

### 申请SSL证书（Let's Encrypt）

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx  # Ubuntu
# 或
yum install -y certbot python3-certbot-nginx  # CentOS

# 申请证书（自动配置Nginx）
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run

# Certbot会自动添加定时任务进行续期
```

### 配置域名解析

1. 登录域名管理控制台
2. 添加DNS记录：
   - A记录：`@` → 服务器IP
   - A记录：`www` → 服务器IP
   - CNAME记录（可选）：`*` → your-domain.com

### 配置微信小程序服务器域名

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发管理」→「开发设置」
3. 配置服务器域名：
   - request合法域名：`https://your-domain.com`
   - uploadFile合法域名：`https://your-domain.com`
   - downloadFile合法域名：`https://your-domain.com`

### 修改前端API地址

编辑 `utils/api.js`：

```javascript
const baseURL = 'https://your-domain.com/api';
```

### 云服务商特定配置

#### 阿里云ECS

```bash
# 配置安全组（阿里云控制台）
# 入方向：
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)

# 使用阿里云RDS（推荐）
# 修改.env中的DB_HOST为RDS地址
```

#### 腾讯云CVM

```bash
# 配置安全组（腾讯云控制台）
# 入站规则：
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)

# 使用腾讯云MySQL（推荐）
# 修改.env中的DB_HOST为云数据库地址
```

#### 华为云ECS

```bash
# 配置安全组（华为云控制台）
# 入方向规则：
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)

# 使用华为云RDS（推荐）
# 修改.env中的DB_HOST为RDS地址
```

## 后端部署（本地开发）

### 1. 环境要求

- Node.js >= 16.x
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
# 编辑 .env 文件，填入正确的配置
```

必要配置：
- `DB_HOST`: 数据库主机
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名
- `PORT`: 服务端口

### 4. 初始化数据库

```bash
# 确保MySQL服务正在运行
node init-db.js
```

### 5. 启动服务

```bash
# 开发模式（使用nodemon）
npm run dev

# 生产模式
npm start
```

### 6. 使用PM2部署（推荐生产环境）

```bash
# 全局安装PM2
npm install -g pm2

# 启动服务
cd backend
pm2 start app.js --name xyzl-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs xyzl-backend

# 重启服务
pm2 restart xyzl-backend

# 停止服务
pm2 stop xyzl-backend

# 设置开机自启
pm2 startup
pm2 save
```

## 前端部署（微信小程序）

### 1. 修改API地址

编辑 `utils/api.js`，将 `baseURL` 修改为生产环境地址：

```javascript
const baseURL = 'https://your-domain.com/api';
```

### 2. 配置服务器域名

在微信小程序后台配置：
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发管理」→「开发设置」
3. 配置服务器域名：
   - request合法域名：`https://your-domain.com`
   - uploadFile合法域名：`https://your-domain.com`
   - downloadFile合法域名：`https://your-domain.com`

### 3. 上传代码

1. 打开微信开发者工具
2. 点击「上传」按钮
3. 填写版本号和项目备注
4. 在微信公众平台提交审核
5. 审核通过后发布

## 数据库安全

### 1. 创建专用数据库用户

```sql
CREATE USER 'xyzl_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON xyzl_db.* TO 'xyzl_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 更新.env配置

```env
DB_USER=xyzl_user
DB_PASSWORD=strong_password
```

## Nginx反向代理配置（可选）

如果使用Nginx，添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS（推荐）
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 前端静态文件（如果有）
    location / {
        root /path/to/frontend;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads {
        proxy_pass http://localhost:3001;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 防火墙配置

确保服务器防火墙开放必要端口：

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 备份策略

### 1. 数据库备份

创建备份脚本 `backup-db.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u xyzl_user -p'password' xyzl_db | gzip > $BACKUP_DIR/xyzl_db_$DATE.sql.gz
find $BACKUP_DIR -name "xyzl_db_*.sql.gz" -mtime +7 -delete
```

设置定时任务：

```bash
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup-db.sh
```

### 2. 上传文件备份

```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/backend/uploads
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
```

## 监控和日志

### 1. PM2监控

```bash
pm2 monit
```

### 2. 日志轮转

配置logrotate：

```
/path/to/backend/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

## 安全检查清单

- [ ] 环境变量已正确配置且不提交到代码库
- [ ] 数据库使用专用用户，权限最小化
- [ ] 使用HTTPS，配置SSL证书
- [ ] 定期备份数据库和上传文件
- [ ] 防火墙正确配置
- [ ] 定期更新依赖包
- [ ] 配置日志监控和告警
- [ ] 小程序服务器域名已配置
- [ ] 敏感数据已加密存储
- [ ] API接口有适当的认证和授权

## 常见问题

### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3001
# 或
netstat -tulpn | grep 3001

# 杀死进程
kill -9 <PID>
```

### 2. 数据库连接失败

- 检查MySQL服务是否运行
- 确认.env配置正确
- 检查防火墙设置
- 验证数据库用户权限

### 3. 上传文件大小限制

在Nginx配置中添加：

```nginx
client_max_body_size 20M;
```

在Express中配置：

```javascript
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
```

## 联系方式

如有问题，请参考项目README.md或联系开发团队。
