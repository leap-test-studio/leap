ORION=$(pwd)
cd $ORION

ssh ykrishnaraju@10.1.100.47 'cd /mnt/data0/ykrishnaraju/vinashak/orchestrator && rm -rf src *.json .prettier* generate.sh keys .*ignore'
ssh ykrishnaraju@10.1.100.47 'cd /mnt/data0/ykrishnaraju/vinashak/studio && rm -rf config public src *.json .prettier* .*ignore .babelrc .env* tailwind*'

scp *.sh *.yml *.json Dockerfile *.conf .*ignore ykrishnaraju@10.1.100.47:/mnt/data0/ykrishnaraju/vinashak

cd $ORION/orchestrator
scp -r src *.json .prettier* generate.sh keys .*ignore ykrishnaraju@10.1.100.47:/mnt/data0/ykrishnaraju/vinashak/orchestrator

cd $ORION/studio
scp -r config public src *.json .prettier* .*ignore .babelrc .env* tailwind* ykrishnaraju@10.1.100.47:/mnt/data0/ykrishnaraju/vinashak/studio

cd $ORION
ssh ykrishnaraju@10.1.100.47 sh /mnt/data0/ykrishnaraju/vinashak/gitcommit.sh
