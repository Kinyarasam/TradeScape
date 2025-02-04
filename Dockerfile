# Use Node.js LTS image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the entire app to the working directory
COPY . .

# Expose port and start the server
EXPOSE 3000
CMD ["npm", "run", "start"]
