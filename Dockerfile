# 1. Base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy source code
COPY . .
# 6. Build NestJS
RUN npm run build

# 7. Expose backend port
EXPOSE 3000

# 8. Run the app
CMD ["node", "dist/main.js"]