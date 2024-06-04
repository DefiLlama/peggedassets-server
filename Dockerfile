# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container to /app
WORKDIR /app

# Clone your repo
RUN git clone https://github.com/DefiLlama/peggedassets-server /app/repo

# Change to the directory of your repo
WORKDIR /app/repo

RUN git checkout api2

# Install any needed packages specified in package.json
RUN npm install

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Run your app when the container launches
CMD ["npm", "run", "api2-prod"]