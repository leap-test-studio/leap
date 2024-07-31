podman run --rm -d -p 3306:3306 --name mysql -e MYSQL_ROOT_USER=root -e MYSQL_ROOT_PASSWORD=S3cret -e MYSQL_DATABASE=automation -e MYSQL_USER=automation -e MYSQL_PASSWORD=S3cret -v ./data/mysql:/var/lib/mysql docker.io/library/mysql

podman run --rm -d -p 6379:6379 --name redis -e REDIS_ARGS="--requirepass S3cret" -v ./data/redis:/data docker.io/redis/redis-stack-server