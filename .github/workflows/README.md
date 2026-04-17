# GitHub Actions 自动部署指南

## 配置步骤

### 1. 推送代码到 GitHub

```bash
cd e:\WorkBuddy\20260416\football-blog

git init
git add .
git commit -m "Initial commit"

# 在 GitHub 创建仓库后
git remote add origin https://github.com/你的用户名/football-blog.git
git push -u origin main
```

### 2. 配置 GitHub Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

需要添加以下 Secrets：

| Secret Name | 说明 | 示例 |
|-------------|------|------|
| `SERVER_HOST` | 腾讯云服务器 IP | `123.45.67.89` |
| `SERVER_USER` | SSH 用户名 | `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH 私钥 | 见下方生成步骤 |
| `SERVER_PORT` | SSH 端口（可选） | `22` |

### 3. 生成 SSH 密钥对

在本地 PowerShell 或 Git Bash 执行：

```bash
# 生成密钥（不要设置密码）
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# 查看公钥（添加到服务器）
cat ~/.ssh/github_actions.pub

# 查看私钥（添加到 GitHub Secrets）
cat ~/.ssh/github_actions
```

### 4. 配置服务器 SSH 免密登录

```bash
# 登录腾讯云服务器
ssh root@你的服务器IP

# 添加公钥到 authorized_keys
echo "粘贴刚才的公钥内容" >> ~/.ssh/authorized_keys

# 确保权限正确
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 5. 首次手动部署

确保服务器已安装 Docker：

```bash
ssh root@你的服务器IP
cd /opt
mkdir -p football-blog

# 退出，后续由 GitHub Actions 自动部署
```

### 6. 触发自动部署

```bash
# 本地修改代码后 push
git add .
git commit -m "更新博客"
git push

# 查看 Actions 运行状态
# GitHub 仓库 → Actions 标签页
```

---

## 部署流程说明

```
本地 push → GitHub Actions 触发
    ↓
安装依赖 + 构建 Next.js
    ↓
SCP 上传构建产物到腾讯云
    ↓
SSH 执行 docker-compose 重启
    ↓
部署完成，访问服务器 IP
```

---

## 常见问题

### Q: 部署失败，提示连接超时
检查腾讯云安全组是否放行 22 端口

### Q: 权限被拒绝 (Permission denied)
- 确认 SSH 私钥正确添加到 GitHub Secrets
- 确认服务器 `~/.ssh/authorized_keys` 包含对应公钥

### Q: 如何回滚？
```bash
# 在服务器手动回滚到上一版本
cd /opt/football-blog
docker-compose down
git reset --hard HEAD~1
docker-compose up -d
```

---

## 可选：配置自定义域名 + HTTPS

在服务器执行：

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
certbot --nginx -d your-domain.com -d www.your-domain.com
```

然后在 GitHub Secrets 添加 `SERVER_HOST` 为你的域名。
