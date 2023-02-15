FROM node:18.12.1-alpine as studio
WORKDIR /app/studio
COPY studio/package.json .
COPY studio/package-lock.json .
RUN npm ci
COPY studio/. .
RUN npm run build

FROM node:18.12.1-alpine
WORKDIR /app/orchestrator
COPY --from=studio /app/studio/build /app/orchestrator/distribution/web
COPY orchestrator/package.json .
COPY orchestrator/package-lock.json .
RUN npm ci
COPY orchestrator/. .
EXPOSE 80
CMD npm start;
