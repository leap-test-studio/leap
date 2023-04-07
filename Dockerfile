FROM node:19.8-slim as studio
RUN apt-get update || : && apt-get install python make g++ -y

WORKDIR /app/studio
RUN rm -rf /app/studio/build
COPY studio/package.json .
COPY studio/package-lock.json .
RUN npm i --force
COPY studio/. .
RUN npm run build

FROM nginx
RUN rm -rf /usr/share/nginx/html
COPY --from=studio /app/studio/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx-prod.conf /etc/nginx/conf.d/app.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
