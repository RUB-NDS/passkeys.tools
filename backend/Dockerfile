FROM node:23.10

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY server.js ./
COPY storage/ ./storage/

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV PORT=3000
ENV DATA_FILE=/data/database.json

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
