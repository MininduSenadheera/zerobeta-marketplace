# Use the official Node.js image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full source code
COPY . .

# Build the app
RUN npm run build

# Expose the NestJS port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
