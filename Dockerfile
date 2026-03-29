# Use an official Node.js runtime as a parent image
FROM node:23

# Set the working directory in the container to /app
WORKDIR /app

# Clone your repo
RUN git clone https://github.com/DefiLlama/peggedassets-server /app/repo

# Change to the directory of your repo
WORKDIR /app/repo

# Check if CUSTOM_GIT_BRANCH_DEPLOYMENT is set and checkout that branch if it exists
RUN if [ -n "$CUSTOM_GIT_BRANCH_DEPLOYMENT" ]; then \
  cd /app/repo && \
  echo "Checking out branch: $CUSTOM_GIT_BRANCH_DEPLOYMENT" && \
  git checkout $CUSTOM_GIT_BRANCH_DEPLOYMENT; \
  fi


# Install nginx and rsync
RUN apt-get update && apt-get install -y nginx rsync sshpass && rm -rf /var/lib/apt/lists/*

# Install any needed packages specified in package.json
RUN npm i -g pnpm
RUN pnpm install

# Make port 5001 available to the world outside this container
EXPOSE 5001

# bash command to keep the container running
CMD ["bash", "-c", "npm run api2-prod; while true; do sleep 10000; done"]