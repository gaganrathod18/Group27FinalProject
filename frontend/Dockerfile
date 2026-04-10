# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source and build (this copies .env too)
COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ──────────────────────────────────────────────
FROM nginx:stable-alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]