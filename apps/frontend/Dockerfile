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

WORKDIR /app/apps/frontend

# Copy package files
COPY apps/frontend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/next.config.ts ./

EXPOSE 3001

CMD ["npm", "run", "start"]
