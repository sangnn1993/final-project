FROM node:20-alpine

WORKDIR /app

# Copy dependencies trước để cache
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

RUN ls -la /app

# Port thống nhất với docker-compose
EXPOSE 5001

# Dùng npm start (đã trỏ đến node src/server.js)
CMD ["npm", "start"]