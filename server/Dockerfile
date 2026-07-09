# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./

# Install ALL deps (including devDependencies like nodemon used in dev compose)
RUN npm ci

# ── Stage 2: production image ──────────────────────────────────────────────────
FROM node:20-alpine AS production

# Add tini for proper PID 1 signal handling (graceful shutdown)
RUN apk add --no-cache tini

WORKDIR /app

# Copy prod-only deps by reinstalling without devDeps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create uploads directory (used by multer for file storage)
RUN mkdir -p uploads

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
