FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install dependencies (including typescript)
RUN npm install

# Copy source code and default data
COPY src ./src
COPY data ./data

# Compile TypeScript
RUN npm run build

# Production runtime stage
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled files and data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 4173

ENV NODE_ENV=production
ENV PORT=4173

CMD ["node", "dist/server.js"]

