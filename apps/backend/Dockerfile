# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install all dependencies
WORKDIR /app
RUN npm install

# Copy backend source
COPY apps/backend ./apps/backend

# Build backend
WORKDIR /app/apps/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app/apps/backend

# Copy package files
COPY apps/backend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/apps/backend/dist ./dist

# Create logs directory
RUN mkdir -p logs

EXPOSE 3000

CMD ["node", "dist/main"]
