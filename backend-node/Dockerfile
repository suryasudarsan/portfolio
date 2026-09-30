# Multi-stage hardened Node.js container
FROM node:20-alpine AS base

# Security flags
ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

# Install dependencies with frozen lockfile or clean production install
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy source
COPY . .

# Run as non-privileged node user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
