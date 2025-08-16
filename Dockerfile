# Use Bun as base image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY frontend/amazon-scraper/package.json ./frontend/amazon-scraper/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend/amazon-scraper
RUN bun run build

# Move back to root and copy built frontend to backend
WORKDIR /app
RUN cp -r frontend/amazon-scraper/dist backend/public

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app
CMD ["bun", "run", "dev"]
