# 每日足球简报博客 - Dockerfile
# 腾讯云轻量服务器/云服务器部署

# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY package*.json ./
# 构建阶段需要 devDependencies（tailwindcss/postcss 等），不加 --only=production
RUN npm ci

# 复制项目文件
COPY . .

# 构建 Next.js 应用
RUN npm run build

# 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建数据目录（用于文章存储）
RUN mkdir -p /app/posts /app/data && chmod 755 /app/posts /app/data

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动命令
CMD ["node", "server.js"]
