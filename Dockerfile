# Use the official Puppeteer image (already includes Chrome)
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run as non-root user (already set in base image)
CMD ["node", "server.js"]
