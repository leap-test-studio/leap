docker compose -f "docker-compose.yml" down
docker image rm vinashak/studio vinashak/docs vinashak/orchestrator vinashak/client vinashak/agent
docker build --pull --rm -f "studio/Dockerfile" -t vinashak/studio:latest "studio"
docker build --pull --rm -f "docs/Dockerfile" -t vinashak/docs:latest "docs"
docker compose -f "docker-compose.yml" up -d --build
