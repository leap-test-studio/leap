docker compose -f "docker-compose.yml" down
sh prettify.sh
docker compose -f "docker-compose.yml" up -d --build
