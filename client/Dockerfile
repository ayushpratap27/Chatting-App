# ── Stage 1: build the React/Vite app ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build — VITE_SERVER_URL is injected at build time via ARG
ARG VITE_SERVER_URL=http://localhost:3001
ENV VITE_SERVER_URL=$VITE_SERVER_URL

COPY . .
RUN npm run build

# ── Stage 2: serve with nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Replace default nginx config with our SPA-aware config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
