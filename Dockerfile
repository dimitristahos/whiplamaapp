# Use the official Node.js 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Nuxt app
RUN npm run build

# Expose the port that Nuxt will run on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "preview"]