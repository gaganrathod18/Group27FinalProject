# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["npm", "start"]