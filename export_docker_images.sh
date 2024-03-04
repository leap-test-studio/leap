start=$(date +%s%N)

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
OUTPUTPATH=$($(pwd)/data/images)
TARGET=10.34.97.113
REMOTE_PATH=/root/workspace/vinashak

mkdir -p ${OUTPUTPATH}

scp docker-compose.yml root@${TARGET}:${REMOTE_PATH}

cd ${OUTPUTPATH}
rm -rf *.docker *.tgz
ssh root@${TARGET} 'cd '${REMOTE_PATH}';npm stop'
for item in "${ARRAY[@]}"; do
    IMAGE=$(echo "${item}" | awk -F "|" '{print $1}')
    FILENAME=$(echo "${item}" | awk -F "|" '{print $2}')

    echo "Export Docker Image: ${IMAGE}"
    docker save --output ${FILENAME}.docker ${IMAGE}
    echo "Compress Docker Image: ${IMAGE}"
    tar -zcvf ${FILENAME}.tgz ${FILENAME}.docker

    ssh root@${TARGET} 'cd '${REMOTE_PATH}'; rm -rf '${FILENAME}'.docker '${FILENAME}'.tgz'
    ssh root@${TARGET} 'docker rmi yuvarajsomavamshi/vinashak-studio'
    echo "Ship Docker Image: ${IMAGE}"

    scp ${FILENAME}.tgz root@${TARGET}:${REMOTE_PATH}
    ssh root@${TARGET} 'cd '${REMOTE_PATH}'; tar -zxvf '${FILENAME}'.tgz'
    echo "Load Docker Image: ${IMAGE}"
    ssh root@${TARGET} 'cd '${REMOTE_PATH}'; docker load -i '${FILENAME}'.docker'
done

ssh root@${TARGET} 'cd '${REMOTE_PATH}';npm start'
ssh root@${TARGET} 'rm -rf ${REMOTE_PATH}/vinashak_studio.*'

end=$(date +%s%N)

echo "Elapsed Time: $(($(($end - $start)) / 1000000))"
