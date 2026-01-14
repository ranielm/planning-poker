# Development Dockerfile for Backend
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema first for generation
COPY prisma ./prisma/

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
