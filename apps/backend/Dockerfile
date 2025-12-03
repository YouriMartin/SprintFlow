# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm install

# Copy backend source
COPY apps/backend ./apps/backend

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy workspace root files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install production dependencies only
RUN npm install --production

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main"]
