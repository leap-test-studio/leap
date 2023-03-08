FROM node:18.12.1-slim as studio
RUN apt-get update || : && apt-get install python make g++ -y

WORKDIR /app/studio
COPY studio/package.json .
COPY studio/package-lock.json .
RUN npm i --force
COPY studio/. .
RUN npm run build

FROM node:18.12.1-slim
WORKDIR /app/orchestrator
COPY --from=studio /app/studio/build /app/orchestrator/distribution/web
COPY orchestrator/package.json .
COPY orchestrator/package-lock.json .
RUN npm i --force --production
COPY orchestrator/. .
EXPOSE 80
CMD npm start;
