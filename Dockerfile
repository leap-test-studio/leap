# ------------------------------------------------------
# Production Build
# ------------------------------------------------------
FROM nginx:1.23.2-alpine
COPY --from=vinashak/studio:latest /app/web/build /usr/share/nginx/web
COPY --from=vinashak/docs:latest /app/docs/build /usr/share/nginx/docs
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
