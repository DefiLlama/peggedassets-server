# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container to /app
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN set -euo pipefail \
    && echo "🔍 Validations..." \
    && npm run prebuild \
    && npm run build \
    && test -f api2/index.ts \
    && test -f api2/ecosystem.config.js \
    && test -f api2/scripts/prod_start.sh \
    && test -f src/adapters/peggedAssets/index.ts \
    && node -e "require('./api2/ecosystem.config.js')"

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Start
CMD ["bash", "-c", "npm run api2-prod"]