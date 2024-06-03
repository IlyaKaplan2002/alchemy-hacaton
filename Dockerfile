# Dockerfile

# Use an existing node alpine image as a base image.
FROM node:alpine

# Set the working directory.
WORKDIR /app

# Copy the package-lock.json file.
COPY yarn.lock .

# Copy the package.json file.
COPY package.json .

RUN set -eux \
    & apk add \
    --no-cache \
    yarn

# Install application dependencies.
RUN yarn

# Copy the rest of the application files.
COPY . .

# Expose the port.
EXPOSE 3000

USER root
RUN yarn build

# Run the application.
CMD ["yarn", "start"]