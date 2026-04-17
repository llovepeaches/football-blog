# 每日足球简报博客 - 腾讯云部署指南

## 部署方式选择

| 方式 | 适用场景 | 难度 | 推荐度 |
|------|----------|------|--------|
| **Docker Compose** | 有服务器管理经验 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **PM2 直接部署** | 简单快速上线 | ⭐ | ⭐⭐⭐⭐ |
| **Vercel 托管** | 无服务器/快速验证 | ⭐ | ⭐⭐⭐ |

---

## 方式一：Docker Compose 部署（推荐）

### 1. 购买腾讯云服务器

- **推荐**: 腾讯云轻量应用服务器 2核4G 或云服务器 CVM
- **系统**: Ubuntu 22.04 LTS
- **带宽**: 3Mbps 以上
- **价格**: 约 50-100 元/月

### 2. 本地准备

确保项目已生成以下文件：
```
football-blog/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── deploy-tencent-cloud.sh
└── DEPLOY.md (本文件)
```

### 3. 服务器端执行

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 下载并运行一键部署脚本
curl -fsSL https://raw.githubusercontent.com/你的用户名/football-blog/main/deploy-tencent-cloud.sh | bash

# 或者手动上传后执行
bash deploy-tencent-cloud.sh
```

### 4. 上传项目文件

```bash
# 本地执行，将项目上传到服务器
scp -r e:\WorkBuddy\20260416\football-blog\* root@你的服务器IP:/opt/football-blog/

# 或者使用 Git
git clone https://github.com/你的用户名/football-blog.git /opt/football-blog
```

### 5. 启动服务

```bash
ssh root@你的服务器IP
cd /opt/football-blog

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 6. 访问博客

- 浏览器访问：`http://你的服务器IP`
- 后台管理：`http://你的服务器IP/admin`

---

## 方式二：PM2 直接部署

### 1. 服务器安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2
```

### 2. 上传并启动

```bash
# 服务器上
cd /opt/football-blog
npm install
npm run build

# 使用 PM2 启动
pm2 start "npx next start -p 3000" --name football-blog

# 保存配置
pm2 save
pm2 startup
```

### 3. Nginx 反向代理

```bash
sudo apt-get install nginx

# 编辑配置
sudo nano /etc/nginx/sites-available/football-blog
```

添加内容：
```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/football-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 方式三：绑定域名 + HTTPS

### 1. 域名解析

在腾讯云 DNSPod 添加 A 记录：
```
主机记录: @
记录类型: A
记录值: 你的服务器IP
```

### 2. 申请 SSL 证书

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 常用运维命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f football-blog
docker-compose logs -f nginx

# 重启服务
docker-compose restart

# 更新部署（重新构建）
./deploy.sh

# 备份数据
tar -czvf backup-$(date +%Y%m%d).tar.gz posts/ data/

# 进入容器
docker exec -it football-blog sh
```

---

## 故障排查

### 端口被占用
```bash
# 查看端口占用
sudo lsof -i :3000
sudo lsof -i :80

# 结束进程
sudo kill -9 PID
```

### 权限问题
```bash
# 修复目录权限
sudo chown -R $USER:$USER /opt/football-blog
chmod -R 755 /opt/football-blog/posts
```

### 防火墙问题
```bash
# 腾讯云控制台 - 安全组 - 入站规则
# 确保开放 80、443、22 端口

# 服务器防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 费用估算

| 项目 | 配置 | 月费用 |
|------|------|--------|
| 轻量服务器 | 2核4G 5M带宽 | ~60元 |
| 域名 | .com 首年 | ~70元 |
| SSL证书 | Let's Encrypt | 免费 |
| **总计** | | **~60元/月** |

---

## 后续更新流程

```bash
# 1. 本地修改代码
# 2. 提交到 Git
git add . && git commit -m "update" && git push

# 3. 服务器拉取更新
cd /opt/football-blog
git pull
./deploy.sh
```

---

## 联系方式

部署遇到问题？
- 腾讯云文档：https://cloud.tencent.com/document/product
- Next.js 部署文档：https://nextjs.org/docs/deployment
