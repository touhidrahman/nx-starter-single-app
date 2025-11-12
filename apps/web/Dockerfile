# Multi-stage Dockerfile to build the web Angular app and serve with nginx
FROM node:22-bullseye-slim AS builder
WORKDIR /app

# Install corepack and pnpm for consistent installs
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy the application source
COPY . .

# Install dependencies and build the production Angular app
RUN pnpm install --frozen-lockfile

# Build the web project (NX workspace)
RUN pnpm nx build web --configuration=production

# Production image using nginx
FROM nginx:stable-alpine AS production

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
