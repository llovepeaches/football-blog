# GitHub Actions 自动部署到腾讯云

实现效果：**本地 `git push` → 自动构建 → 自动部署到腾讯云服务器**

---

## 📁 生成的文件

| 文件 | 说明 |
|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 工作流配置 |
| `.github/workflows/README.md` | 详细配置说明 |
| `deploy-github-actions.sh` | 一键配置脚本（Linux/Mac） |

---

## 🚀 快速配置（Windows 手动版）

### 步骤 1：推送代码到 GitHub

```powershell
cd e:\WorkBuddy\20260416\football-blog

# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 在 https://github.com/new 创建仓库，然后：
git remote add origin https://github.com/你的用户名/football-blog.git
git push -u origin main
```

### 步骤 2：生成 SSH 密钥

```powershell
# 在 PowerShell 执行
ssh-keygen -t ed25519 -C "football-blog-deploy" -f "$env:USERPROFILE\.ssh\football_blog_deploy" -N ""

# 查看公钥（复制到服务器）
Get-Content "$env:USERPROFILE\.ssh\football_blog_deploy.pub"

# 查看私钥（复制到 GitHub）
Get-Content "$env:USERPROFILE\.ssh\football_blog_deploy"
```

### 步骤 3：配置腾讯云服务器

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 添加公钥
echo "粘贴刚才的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 创建部署目录
mkdir -p /opt/football-blog
```

### 步骤 4：配置 GitHub Secrets

访问：`https://github.com/你的用户名/football-blog/settings/secrets/actions`

点击 **New repository secret**，添加以下配置：

| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | 你的腾讯云服务器 IP，如 `123.45.67.89` |
| `SERVER_USER` | SSH 用户名，如 `root` |
| `SSH_PRIVATE_KEY` | 完整的私钥内容（`~/.ssh/football_blog_deploy` 文件内容） |

### 步骤 5：触发部署

```powershell
# 本地修改任意文件，然后 push
git add .
git commit -m "更新博客内容"
git push
```

访问 `https://github.com/你的用户名/football-blog/actions` 查看部署进度。

---

## 🔄 部署流程

```
你执行 git push
    ↓
GitHub Actions 自动触发
    ↓
1. 检出代码
2. npm ci 安装依赖
3. npm run build 构建
4. SCP 上传到腾讯云
5. SSH 执行 docker-compose 重启
    ↓
🎉 部署完成，访问 http://服务器IP
```

---

## 🛠️ 手动触发部署

GitHub 仓库页面 → Actions → Deploy to Tencent Cloud → Run workflow

---

## ❓ 常见问题

### 部署失败：Connection refused
- 检查腾讯云安全组是否放行 **22 端口**
- 检查服务器 IP 是否正确

### 部署失败：Permission denied
- 确认 SSH 私钥完整复制到 GitHub Secrets（包含 `-----BEGIN OPENSSH PRIVATE KEY-----` 等）
- 确认服务器 `~/.ssh/authorized_keys` 包含对应公钥

### 如何查看部署日志？
GitHub 仓库 → Actions → 点击最新的 workflow run → 查看日志

---

## 🔒 安全配置建议

1. **禁用密码登录**（服务器执行）：
```bash
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

2. **修改默认 SSH 端口**（可选）：
```bash
# 修改 /etc/ssh/sshd_config 中的 Port
# 同时更新 GitHub Secrets 中的 SERVER_PORT
```

---

## 📚 相关文档

- 详细配置说明：`.github/workflows/README.md`
- Docker 部署文档：`DEPLOY.md`
