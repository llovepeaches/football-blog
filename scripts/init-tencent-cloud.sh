#!/bin/bash
# =============================================================================
# 腾讯云轻量服务器一键初始化脚本
# 适用于：Ubuntu 22.04 LTS
# 功能：Docker 安装、防火墙配置、SSH 安全加固、博客部署准备
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
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
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "正在更新系统软件包..."
    apt-get update -qq
    apt-get upgrade -y -qq
    log_success "系统更新完成"
}

# 安装基础工具
install_base_tools() {
    log_info "正在安装基础工具..."
    apt-get install -y -qq \
        curl \
        wget \
        git \
        vim \
        htop \
        net-tools \
        unzip \
        ca-certificates \
        gnupg \
        lsb-release
    log_success "基础工具安装完成"
}

# 安装 Docker
install_docker() {
    log_info "正在安装 Docker..."
    
    # 移除旧版本
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # 添加 Docker 官方 GPG 密钥
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    # 添加 Docker 软件源
    echo \
        "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # 安装 Docker
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # 启动 Docker
    systemctl start docker
    systemctl enable docker
    
    # 安装 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_info "正在安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
            -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    log_success "Docker 安装完成"
    docker --version
    docker-compose --version
}

# 配置防火墙
setup_firewall() {
    log_info "正在配置防火墙..."
    
    # 安装 UFW（如果未安装）
    apt-get install -y -qq ufw
    
    # 默认策略
    ufw default deny incoming
    ufw default allow outgoing
    
    # 允许 SSH
    ufw allow 22/tcp comment 'SSH'
    
    # 允许 HTTP/HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # 允许博客端口（如果使用非标准端口）
    ufw allow 3000/tcp comment 'Next.js Blog'
    
    # 启用防火墙（非交互模式）
    echo "y" | ufw enable
    
    log_success "防火墙配置完成"
    ufw status verbose
}

# 配置 SSH 安全
setup_ssh_security() {
    log_info "正在配置 SSH 安全..."
    
    # 备份原配置
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%Y%m%d)
    
    # 修改 SSH 配置
    cat > /etc/ssh/sshd_config.d/hardening.conf << 'EOF'
# 禁用 root 密码登录（仅允许密钥）
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes

# 限制连接数
MaxAuthTries 3
MaxSessions 2

# 空闲超时
ClientAliveInterval 300
ClientAliveCountMax 2

# 禁用 X11 转发
X11Forwarding no
EOF
    
    # 确保 .ssh 目录存在
    mkdir -p /root/.ssh
    chmod 700 /root/.ssh
    touch /root/.ssh/authorized_keys
    chmod 600 /root/.ssh/authorized_keys
    
    # 重启 SSH 服务
    systemctl restart sshd
    
    log_success "SSH 安全配置完成"
    log_warn "注意：请确保已将公钥添加到 /root/.ssh/authorized_keys 后再断开连接！"
}

# 创建博客部署目录
setup_blog_directory() {
    log_info "正在创建博客部署目录..."
    
    DEPLOY_PATH="/opt/football-blog"
    mkdir -p $DEPLOY_PATH
    mkdir -p $DEPLOY_PATH/posts
    mkdir -p $DEPLOY_PATH/public
    
    # 设置权限
    chmod -R 755 $DEPLOY_PATH
    
    log_success "博客目录创建完成: $DEPLOY_PATH"
}

# 配置 Swap（小内存服务器建议）
setup_swap() {
    log_info "正在检查 Swap..."
    
    # 检查是否已存在 swap
    if swapon --show | grep -q "swap"; then
        log_info "Swap 已存在，跳过创建"
        return
    fi
    
    # 获取内存大小（MB）
    MEM_SIZE=$(free -m | awk '/^Mem:/{print $2}')
    
    # 如果内存小于 2GB，创建 2GB swap
    if [ "$MEM_SIZE" -lt 2048 ]; then
        log_info "内存小于 2GB，创建 2GB Swap..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        log_success "Swap 创建完成"
    else
        log_info "内存充足 ($MEM_SIZE MB)，无需创建 Swap"
    fi
}

# 安装 Node.js（可选，用于本地调试）
install_nodejs() {
    log_info "正在安装 Node.js..."
    
    # 使用 NodeSource 安装 Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
    
    log_success "Node.js 安装完成"
    node --version
    npm --version
}

# 安装 Nginx（可选，用于反向代理）
install_nginx() {
    log_info "正在安装 Nginx..."
    
    apt-get install -y -qq nginx
    
    # 启动 Nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx 安装完成"
}

# 配置自动更新
setup_auto_update() {
    log_info "正在配置自动安全更新..."
    
    apt-get install -y -qq unattended-upgrades
    
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    
    log_success "自动更新配置完成"
}

# 显示完成信息
show_completion_info() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 服务器初始化完成！${NC}"
    echo "=========================================="
    echo ""
    echo "📋 已完成的配置："
    echo "  ✓ 系统软件包更新"
    echo "  ✓ Docker & Docker Compose 安装"
    echo "  ✓ 防火墙配置（开放 22/80/443/3000）"
    echo "  ✓ SSH 安全加固"
    echo "  ✓ 博客部署目录创建 (/opt/football-blog)"
    echo "  ✓ Swap 配置（如需要）"
    echo "  ✓ Node.js 20 安装"
    echo "  ✓ Nginx 安装"
    echo "  ✓ 自动安全更新"
    echo ""
    echo "📌 下一步操作："
    echo "  1. 将 SSH 公钥添加到: /root/.ssh/authorized_keys"
    echo "  2. 在 GitHub 添加服务器 IP 到 Secrets"
    echo "  3. 推送代码触发自动部署"
    echo ""
    echo "🔧 常用命令："
    echo "  查看 Docker 状态: systemctl status docker"
    echo "  查看防火墙状态: ufw status"
    echo "  查看系统资源: htop"
    echo ""
    echo "⚠️  重要提醒："
    echo "  - 请确保 SSH 密钥已配置后再断开当前连接"
    echo "  - 防火墙已启用，仅开放必要端口"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "  腾讯云轻量服务器一键初始化脚本"
    echo "=========================================="
    echo ""
    
    check_root
    
    # 确认执行
    read -p "确定要开始初始化吗？(y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        log_info "已取消"
        exit 0
    fi
    
    # 执行各项配置
    update_system
    install_base_tools
    install_docker
    setup_swap
    setup_firewall
    setup_ssh_security
    setup_blog_directory
    install_nodejs
    install_nginx
    setup_auto_update
    
    # 清理
    apt-get autoremove -y -qq
    apt-get autoclean -qq
    
    show_completion_info
}

# 运行主函数
main "$@"
