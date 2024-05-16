FROM --platform=linux/amd64 node:18 as studio
RUN apt-get update

WORKDIR /app/studio
RUN rm -rf /app/studio/build
COPY studio/package.json .
RUN npm config set strict-ssl false
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set fetch-timeout 120000
RUN npm config set fetch-retries 10
RUN npm install --omit=dev --unsafe-perm=true --force
RUN npm install --unsafe-perm=true --force
COPY studio/. .
RUN npm run build


FROM --platform=linux/amd64 node:18 as documentation
RUN apt-get update

WORKDIR /app/documentation
RUN rm -rf /app/documentation/build
COPY documentation/package.json .
RUN npm config set strict-ssl false
RUN npm config set fetch-retry-maxtimeout 120000

RUN npm config set fetch-timeout 120000
RUN npm config set fetch-retries 10
RUN npm install --omit=dev --unsafe-perm=true --force
RUN npm install --unsafe-perm=true --force
COPY documentation/. .
RUN npm run build

FROM --platform=linux/amd64 node:18 as orchestrator
RUN apt-get update
WORKDIR /app/orchestrator
COPY orchestrator/package.json .
RUN npm config set strict-ssl false
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set fetch-timeout 120000
RUN npm config set fetch-retries 10
RUN npm install --omit=dev --unsafe-perm=true --force
RUN npm install --unsafe-perm=true --force
COPY orchestrator/. .
EXPOSE 80
CMD npm start;

FROM nginx
RUN apt-get update && apt-get install procps nodejs -y && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/orchestrator /app/studio /app/documentation

RUN rm -rf /usr/share/nginx
COPY --from=studio /app/studio/build /app/studio
COPY --from=documentation /app/documentation/build /app/documentation
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx-prod.conf /etc/nginx/conf.d/app.conf
COPY --from=orchestrator /app/orchestrator /app/orchestrator
EXPOSE 80

CMD nginx -g 'daemon off;' & node /app/orchestrator/src/server.js