#!/bin/bash
# =============================================================================
# 每日足球简报博客 - 腾讯云一键部署脚本
# 适用于：腾讯云轻量应用服务器 / 云服务器 CVM
# 系统要求：Ubuntu 20.04+ / CentOS 8+ / Debian 11+
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="football-blog"
PROJECT_DIR="/opt/$PROJECT_NAME"
DOMAIN="${1:-}"  # 可通过参数传入域名

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用 root 权限运行此脚本: sudo bash deploy-tencent-cloud.sh"
        exit 1
    fi
}

# 检测系统类型
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        log_error "无法检测操作系统类型"
        exit 1
    fi
    log_info "检测到系统: $OS $VERSION"
}

# 安装 Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker 已安装，跳过安装步骤"
        docker --version
        return
    fi

    log_info "正在安装 Docker..."
    
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "rocky" ]] || [[ "$OS" == "almalinux" ]]; then
        yum install -y yum-utils
        yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        systemctl start docker
        systemctl enable docker
    fi

    # 配置 Docker 镜像加速（腾讯云）
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://hub-mirror.c.163.com"
  ]
}
EOF
    systemctl restart docker
    log_info "Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        log_info "Docker Compose 已安装"
        return
    fi

    log_info "正在安装 Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    log_info "Docker Compose 安装完成"
}

# 准备项目目录
prepare_project() {
    log_info "准备项目目录..."
    mkdir -p $PROJECT_DIR
    mkdir -p $PROJECT_DIR/posts
    mkdir -p $PROJECT_DIR/data
    mkdir -p $PROJECT_DIR/public/music
    mkdir -p $PROJECT_DIR/logs/nginx
    mkdir -p $PROJECT_DIR/ssl
    
    # 设置目录权限
    chmod -R 755 $PROJECT_DIR
    log_info "项目目录已创建: $PROJECT_DIR"
}

# 创建健康检查 API
create_health_api() {
    log_info "创建健康检查 API..."
    mkdir -p $PROJECT_DIR/pages/api
    cat > $PROJECT_DIR/pages/api/health.ts <<'EOF'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}
EOF
}

# 创建示例文章
create_sample_posts() {
    log_info "创建示例文章..."
    
    cat > $PROJECT_DIR/posts/welcome.md <<'EOF'
---
title: "欢迎使用每日足球简报"
date: "2026-04-16"
tags: ["公告", "足球"]
summary: "欢迎来到每日足球简报博客，这里汇集了最新的足球赛事资讯、深度分析和精彩评论。"
---

# 欢迎使用每日足球简报

欢迎来到**每日足球简报**！这是一个专注于足球资讯的个人博客。

## 主要功能

- 📰 **每日简报**: 每日更新足球新闻和赛事结果
- 🏷️ **标签分类**: 按联赛、球队、话题分类浏览
- 🎵 **音乐播放**: 边阅读边享受音乐
- ⚙️ **后台管理**: 支持 Markdown 文章导入

## 支持的联赛

- 英超 (Premier League)
- 西甲 (La Liga)
- 意甲 (Serie A)
- 德甲 (Bundesliga)
- 法甲 (Ligue 1)
- 中超 (Chinese Super League)

## 开始使用

访问后台管理页面 `/admin` 即可导入新的 Markdown 文章。
EOF

    cat > $PROJECT_DIR/posts/premier-league-weekly.md <<'EOF'
---
title: "英超周报：争冠进入白热化阶段"
date: "2026-04-15"
tags: ["英超", "周报"]
summary: "本周英超精彩纷呈，争冠球队纷纷取胜，保级大战也愈发激烈。"
---

# 英超周报：争冠进入白热化阶段

## 焦点战役

本周英超联赛上演了多场精彩对决，争冠形势愈发扑朔迷离。

### 关键比赛结果

| 主队 | 比分 | 客队 |
|------|------|------|
| 曼城 | 3-1 | 阿森纳 |
| 利物浦 | 2-0 | 布莱顿 |
| 曼联 | 1-1 | 切尔西 |

## 积分榜

争冠三强你追我赶，分差维持在极小范围内。

## 下周看点

- 曼城 vs 利物浦 天王山之战
- 热刺争四关键战

敬请期待下周的精彩赛事！
EOF
}

# 创建部署脚本
create_deploy_script() {
    log_info "创建部署脚本..."
    cat > $PROJECT_DIR/deploy.sh <<EOF
#!/bin/bash
set -e
cd $PROJECT_DIR

# 拉取最新代码（如果使用 git）
# git pull origin main

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 清理旧镜像
docker image prune -f

echo "部署完成！访问 http://\$(curl -s ifconfig.me):80"
EOF
    chmod +x $PROJECT_DIR/deploy.sh
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 22/tcp
        ufw --force enable
        log_info "UFW 防火墙已配置"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        log_info "Firewalld 防火墙已配置"
    fi
}

# 配置腾讯云监控（可选）
configure_monitoring() {
    log_info "提示: 可在腾讯云控制台开启云监控，实时查看服务器性能"
}

# 主函数
main() {
    echo "========================================"
    echo "  每日足球简报博客 - 腾讯云部署脚本"
    echo "========================================"
    
    check_root
    detect_os
    install_docker
    install_docker_compose
    prepare_project
    create_health_api
    create_sample_posts
    create_deploy_script
    configure_firewall
    
    echo ""
    echo "========================================"
    log_info "基础环境配置完成！"
    echo "========================================"
    echo ""
    log_warn "请手动完成以下步骤："
    echo ""
    echo "1. 将项目文件上传到服务器:"
    echo "   scp -r ./* root@你的服务器IP:$PROJECT_DIR/"
    echo ""
    echo "2. 进入项目目录并启动:"
    echo "   cd $PROJECT_DIR && docker-compose up -d"
    echo ""
    echo "3. 访问博客:"
    echo "   http://你的服务器IP"
    echo ""
    echo "4. 后续更新只需运行:"
    echo "   $PROJECT_DIR/deploy.sh"
    echo ""
    echo "========================================"
}

main "$@"
