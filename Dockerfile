FROM --platform=linux/amd64 node:lts-alpine as engine_utils

# Update apk
RUN apk update

WORKDIR /app/engine_utils
ENV NODE_ENV production
COPY .npmrc ~/.npmrc
COPY engine_utils/package.json .
RUN npm i --omit=dev -f
COPY engine_utils/. .
RUN npm run build

FROM --platform=linux/amd64 node:lts-alpine as studio

# Update apk
RUN apk update

WORKDIR /app/studio/
COPY .npmrc ~/.npmrc
COPY studio/package.json .

RUN npm uninstall engine_utils -f
RUN rm -rf node_modules/engine_utils && mkdir -p node_modules/engine_utils
RUN npm i -f
COPY --from=engine_utils /app/engine_utils/. node_modules/engine_utils/
COPY studio/. .
COPY pre_build.js .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build

FROM --platform=linux/amd64 node:lts-alpine as documentation

# Update apk
RUN apk update

WORKDIR /app/documentation
COPY .npmrc ~/.npmrc
COPY documentation/package.json .

RUN npm i --omit=dev -f
COPY documentation/. .
COPY pre_build.js .
RUN node ./pre_build.js $imageTag $oktaEnabled
RUN npm run build

# Use an official Node.js runtime as a parent image
FROM --platform=linux/amd64 node:lts-alpine as app
WORKDIR /app/orchestrator

# Update apk
RUN apk update

# Copy necessary files for UI
RUN mkdir -p /app/studio /app/documentation /app/logs /app/certs
COPY --from=studio /app/studio/build /app/studio
COPY --from=documentation /app/documentation/. /app/documentation

# Install Nginx and Supervisor
RUN apk add procps nginx supervisor -f

# Copy npmrc setting
COPY .npmrc ~/.npmrc

# Copy package.json file
COPY orchestrator/package.json .
RUN npm uninstall engine_utils -f
RUN npm i -f
RUN mkdir -p /app/orchestrator/node_modules/engine_utils
COPY --from=engine_utils /app/engine_utils/. /app/orchestrator/node_modules/engine_utils
COPY orchestrator/. .

# Copy Nginx configuration file
COPY config/nginx-prod.conf /etc/nginx/nginx.conf

# Copy supervisord configuration file
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy AWS certificate file
COPY orchestrator/keys/id_rsa_priv.pem /app/certs/SM_cacert.pem

# Set Environment Variables
ENV LOG_DIR /app/logs
ENV NODE_ENV production
ENV NODE_EXTRA_CA_CERTS /app/certs/SM_cacert.pem

# Expose ports
EXPOSE 80

# Start supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
