ARRAY=(
    "yuvarajsomavamshi/vinashak-studio|vinashak_studio"
    "yuvarajsomavamshi/vinashak-controller|vinashak_controller"
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

OUTPUTPATH=$(pwd)"/data/images"

mkdir -p ${OUTPUTPATH}

cd ${OUTPUTPATH}
rm -rf *.docker *.tgz
for item in "${ARRAY[@]}"; do
    IMAGE=$(echo "${item}" | awk -F "|" '{print $1}')
    FILENAME=$(echo "${item}" | awk -F "|" '{print $2}')

    docker save --output ${FILENAME}.docker ${IMAGE}

    scp ${FILENAME}.docker root@10.27.21.41:/root/workspace/vinashak
    ssh root@10.27.21.41 docker load -i /root/workspace/vinashak/${FILENAME}.docker
    ssh root@10.27.21.41 rm -rf /root/workspace/vinashak/${FILENAME}.docker
    
    #tar -zcvf ${FILENAME}.tgz ${FILENAME}.docker
    #rm -rf ${FILENAME}.docker
done
