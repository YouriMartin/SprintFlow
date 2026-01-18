# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install all dependencies
WORKDIR /app
RUN npm install

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/apps/frontend/build ./build
COPY --from=builder /app/apps/frontend/package.json ./

# SvelteKit with adapter-node generates a standalone server
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "build"]
