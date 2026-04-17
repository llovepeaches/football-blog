#!/bin/bash
# GitHub Actions 自动部署配置脚本
# 在本地运行此脚本，快速完成部署配置

set -e

echo "🚀 足球博客 - GitHub Actions 自动部署配置"
echo "=========================================="

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 football-blog 项目根目录运行此脚本"
    exit 1
fi

# 检查 Git 是否初始化
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "📋 配置检查清单："
echo "-------------------"
echo ""
echo "1. 在 GitHub 创建仓库"
echo "   访问: https://github.com/new"
echo "   仓库名: football-blog"
echo ""
read -p "   创建完成后，输入仓库地址 (如: https://github.com/用户名/football-blog.git): " REPO_URL

# 配置远程仓库
if git remote | grep -q "origin"; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

echo ""
echo "2. 生成 SSH 密钥对"
echo "-------------------"
KEY_PATH="$HOME/.ssh/football_blog_deploy"

if [ -f "$KEY_PATH" ]; then
    echo "⚠️  密钥已存在: $KEY_PATH"
else
    echo "🔑 生成 ED25519 密钥对..."
    ssh-keygen -t ed25519 -C "football-blog-deploy" -f "$KEY_PATH" -N ""
    echo "✅ 密钥生成完成"
fi

echo ""
echo "📋 请复制以下内容到 GitHub Secrets:"
echo "===================================="
echo ""
echo "Secret Name: SSH_PRIVATE_KEY"
echo "Value:"
cat "$KEY_PATH"
echo ""
echo "===================================="
echo ""

# 提示服务器配置
echo "3. 配置腾讯云服务器"
echo "-------------------"
echo "请复制以下公钥到你的服务器 ~/.ssh/authorized_keys:"
echo ""
cat "$KEY_PATH.pub"
echo ""

read -p "   输入服务器 IP 地址: " SERVER_IP
read -p "   输入 SSH 用户名 (默认 root): " SERVER_USER
SERVER_USER=${SERVER_USER:-root}

# 测试连接
echo ""
echo "🧪 测试 SSH 连接..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" "echo 'SSH 连接成功'" 2>/dev/null; then
    echo "✅ SSH 连接测试通过"
else
    echo "⚠️  SSH 连接失败，请确认："
    echo "   - 服务器 IP 正确"
    echo "   - 安全组放行 22 端口"
    echo "   - 公钥已添加到 authorized_keys"
fi

echo ""
echo "📤 推送代码到 GitHub..."
git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || echo "⚠️  推送失败，请手动执行: git push"

echo ""
echo "🎉 配置完成！"
echo "=============="
echo ""
echo "下一步："
echo "1. 访问: $REPO_URL/settings/secrets/actions"
echo "2. 添加以下 Secrets:"
echo "   - SERVER_HOST = $SERVER_IP"
echo "   - SERVER_USER = $SERVER_USER"
echo "   - SSH_PRIVATE_KEY = (上面显示的私钥内容)"
echo ""
echo "3. 推送任意代码触发自动部署"
echo "   git commit --allow-empty -m 'trigger deploy' && git push"
echo ""
echo "4. 查看部署状态: $REPO_URL/actions"
echo ""
