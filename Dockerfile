FROM node:17.1-slim as studio
RUN apt-get update || : && apt-get install python make g++ -y

WORKDIR /app/studio
RUN rm -rf /app/studio/build
COPY studio/package.json .
COPY studio/package-lock.json .
RUN npm config set proxy http://10.1.100.18:3128
RUN npm config set https-proxy http://10.1.100.18:3128
RUN npm config set strict-ssl false
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set fetch-timeout 120000
RUN npm config set fetch-retries 10
RUN npm install --omit=dev --unsafe-perm=true
RUN npm install --unsafe-perm=true
COPY studio/. .
RUN npm run build

FROM nginx
RUN rm -rf /usr/share/nginx/html
COPY --from=studio /app/studio/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx-prod.conf /etc/nginx/conf.d/app.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
