FROM --platform=linux/amd64 node:20 as engine_utils
COPY .npmrc ~/.npmrc
RUN apt-get update
WORKDIR /app/engine_utils
COPY engine_utils/package.json .
RUN npm i -g npm
RUN npm i -f
COPY engine_utils/. .
RUN npm run build

FROM --platform=linux/amd64 node:20 as studio
COPY .npmrc ~/.npmrc
RUN apt-get update
RUN mkdir -p /app/engine_utils

COPY --from=engine_utils /app/engine_utils/. /app/engine_utils
RUN ls -lrta /app/engine_utils
WORKDIR /app/studio/
COPY pre_build.js .
COPY studio/package.json .
RUN npm i -g npm
RUN npm i --save -f /app/engine_utils
RUN npm i -f
COPY studio/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

FROM --platform=linux/amd64 node:20 as documentation
COPY .npmrc ~/.npmrc
RUN apt-get update

WORKDIR /app/documentation
COPY pre_build.js .
RUN rm -rf /app/documentation/build ~/.npmrc
COPY documentation/package.json .
RUN npm i -g npm
RUN npm i -f
COPY documentation/. .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build
RUN rm -rf ./pre_build.js

# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:20
COPY .npmrc ~/.npmrc

# Install Nginx
RUN apt-get update
RUN apt-get install procps nginx supervisor -y
RUN mkdir -p /app/studio /app/documentation /app/logs /app/engine_utils
# RUN rm -rf ~/.npmrc
COPY --from=studio /app/studio/build /app/studio
COPY --from=documentation /app/documentation/. /app/documentation
COPY --from=engine_utils /app/engine_utils/. /app/engine_utils

WORKDIR /app/orchestrator
COPY orchestrator/package.json .
RUN npm i -g npm serve
RUN npm i --save --f /app/engine_utils
RUN npm i -f
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
