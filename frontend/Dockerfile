FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and configs
COPY package*.json tsconfig*.json vite.config.ts index.html ./

# Install dependencies
RUN npm install

# Copy source and assets
COPY public ./public
COPY src ./src

# Build static production bundle
RUN npm run build

# Production web server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

