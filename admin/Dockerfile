# Use an official Node.js image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to optimize the build
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Run the production build (this will create the optimized build)
RUN npm run build

# Install a lightweight web server to serve the build
RUN npm install -g serve

# Expose the port that the app will run on
EXPOSE 3000

# Start the app using the production build
CMD ["serve", "-s", "build"]
