# Use an official Node.js runtime as a parent image
FROM node:23

# Set the working directory in the container
WORKDIR /app/repo

# Copy the current Coolify/Git repo into the container
COPY . .

# Install nginx and rsync
RUN apt-get update && apt-get install -y nginx rsync sshpass && rm -rf /var/lib/apt/lists/*

# Install pnpm and dependencies
RUN npm i -g pnpm
RUN pnpm install

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Start the app
CMD ["bash", "-c", "npm run api2-prod; while true; do sleep 10000; done"]