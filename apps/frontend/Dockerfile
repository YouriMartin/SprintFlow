# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm install

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Build frontend
WORKDIR /app/apps/frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install production dependencies
RUN npm install --production

# Copy built application
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/next.config.ts ./apps/frontend/

WORKDIR /app/apps/frontend

EXPOSE 3001

CMD ["npm", "run", "start"]
