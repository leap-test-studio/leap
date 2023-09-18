ARRAY=(
    "yuvarajsomavamshi/vinashak-studio|vinashak_studio"
    #"selenium/video|selenium_video"
    #"selenium/node-chrome|selenium_node_chrome"
    #"selenium/event-bus|selenium_event_bus"
    #"selenium/session-queue|selenium_session_queue"
    #"selenium/sessions|selenium_sessions"
    #"selenium/router|selenium_router"
    #"selenium/distributor|selenium_distributor"
    #"redis/redis-stack-server|redis_stack_server"
    #"mysql|mysql_server"
)

npm run build
OUTPUTPATH=$(pwd)"/data/images"

mkdir -p ${OUTPUTPATH}

scp docker-compose.yml root@10.27.21.41:/root/workspace/vinashak

cd ${OUTPUTPATH}
rm -rf *.docker *.tgz
ssh root@10.27.21.41 'cd /root/workspace/vinashak;npm stop'
for item in "${ARRAY[@]}"; do
    IMAGE=$(echo "${item}" | awk -F "|" '{print $1}')
    FILENAME=$(echo "${item}" | awk -F "|" '{print $2}')

    echo "Export Docker Image: ${IMAGE}"
    docker save --output ${FILENAME}.docker ${IMAGE}
    echo "Compress Docker Image: ${IMAGE}"
    tar -zcvf ${FILENAME}.tgz ${FILENAME}.docker

    ssh root@10.27.21.41 'cd /root/workspace/vinashak; rm -rf '${FILENAME}'.docker '${FILENAME}'.tgz'
    ssh root@10.27.21.41 'docker rmi yuvarajsomavamshi/vinashak-studio'
    echo "Ship Docker Image: ${IMAGE}"

    scp ${FILENAME}.tgz root@10.27.21.41:/root/workspace/vinashak
    ssh root@10.27.21.41 'cd /root/workspace/vinashak; tar -zxvf '${FILENAME}'.tgz'
    echo "Load Docker Image: ${IMAGE}"
    ssh root@10.27.21.41 'cd /root/workspace/vinashak; docker load -i '${FILENAME}'.docker'
done

ssh root@10.27.21.41 'cd /root/workspace/vinashak;npm start'
