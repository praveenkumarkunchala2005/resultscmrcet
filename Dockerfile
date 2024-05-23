# Use an official Node.js runtime as a parent image
FROM node:16-slim

# Set the working directory
WORKDIR /usr/src/app

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set the path to the Chromium executable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Command to run the application
CMD [ "node", "app.js" ]
