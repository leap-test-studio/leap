FROM --platform=linux/amd64 node:20 as libs
RUN apt-get update
WORKDIR /app/engine_utils
COPY .npmrc ~/.npmrc
COPY engine_utils/package*.json .
RUN npm i -g -f npm
RUN npm i
COPY engine_utils/. .
RUN npm run build

FROM --platform=linux/amd64 node:20 as studio
RUN apt-get update
RUN mkdir -p /app/engine_utils

COPY --from=libs /app/engine_utils/. /app/engine_utils

WORKDIR /app/studio/
COPY pre_build.js .
RUN rm -rf /app/studio/build ~/.npmrc
COPY .npmrc ~/.npmrc
COPY studio/package*.json .
RUN npm i -g -f npm
RUN npm i
COPY studio/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

FROM --platform=linux/amd64 node:20 as documentation
RUN apt-get update

WORKDIR /app/documentation
COPY pre_build.js .
RUN rm -rf /app/documentation/build ~/.npmrc
COPY documentation/package*.json .
COPY .npmrc ~/.npmrc
RUN npm i -g -f npm
RUN npm i
COPY documentation/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:20

# Install Nginx
RUN apt-get update
RUN apt-get install procps nginx supervisor -y
RUN mkdir -p /app/studio /app/documentation /app/logs /app/engine_utils
# RUN rm -rf ~/.npmrc
COPY --from=studio /app/studio/build /app/studio
COPY --from=documentation /app/documentation/. /app/documentation

# Create app directory
WORKDIR /app
COPY --from=libs /app/engine_utils/. /app/engine_utils

COPY orchestrator/package*.json .
COPY .npmrc ~/.npmrc
RUN npm i -g -f npm serve
RUN npm i
COPY orchestrator/. .

# Copy Nginx configuration file
COPY config/nginx-prod.conf /etc/nginx/nginx.conf

# Copy supervisord configuration file
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy AWS certificate file
COPY orchestrator/keys/id_rsa_priv.pem /app/SM_cacert.pem

# Set Environment Variables
ENV LOG_DIR /app/logs

ENV NODE_EXTRA_CA_CERTS /app/SM_cacert.pem
# Expose ports
EXPOSE 80

# Start supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
