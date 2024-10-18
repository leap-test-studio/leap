FROM --platform=linux/amd64 node:18 as studio
RUN apt-get update

WORKDIR /app/studio/
COPY pre_build.js .
RUN rm -rf /app/studio/build ~/.npmrc
COPY .npmrc ~/.npmrc
COPY studio/package.json .
RUN npm i -g npm@latest
RUN npm install --omit=dev --unsafe-perm=true --force --silent
RUN npm install --unsafe-perm=true --force --silent
COPY studio/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

FROM --platform=linux/amd64 node:18 as documentation
RUN apt-get update

WORKDIR /app/documentation
COPY pre_build.js .
RUN rm -rf /app/documentation/build ~/.npmrc
COPY documentation/package.json .
COPY .npmrc ~/.npmrc
RUN npm i -g npm@latest
RUN npm install --omit=dev --unsafe-perm=true --force --silent
RUN npm install --unsafe-perm=true --force --silent
COPY documentation/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:18

# Install Nginx
RUN apt-get update
RUN apt-get install procps nginx supervisor -y
RUN mkdir -p /app/studio /app/documentation /app/logs
RUN rm -rf ~/.npmrc
COPY --from=studio /app/studio/build /app/studio
COPY --from=documentation /app/documentation/. /app/documentation

# Create app directory
WORKDIR /app
COPY orchestrator/package.json .
COPY .npmrc ~/.npmrc
RUN npm i -g npm@latest serve@latest
RUN npm install --omit=dev --unsafe-perm=true --force --silent
RUN npm install --unsafe-perm=true --force --silent
COPY orchestrator/. .

# Copy Nginx configuration file
COPY config/nginx-prod.conf /etc/nginx/nginx.conf

# Copy supervisord configuration file
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy AWS certificate file
COPY config/SM_cacert.pem /app/SM_cacert.pem

# Set Environment Variables
ENV LOG_DIR /app/logs

ENV NODE_EXTRA_CA_CERTS /app/SM_cacert.pem
# Expose ports
EXPOSE 80

# Start supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
