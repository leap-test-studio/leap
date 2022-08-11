VINASHAK_HOME=`pwd`
cd $VINASHAK_HOME/agent
npm run dev:upgrade
cd $VINASHAK_HOME/orchestrator
npm run dev:upgrade
cd $VINASHAK_HOME/studio
npm run dev:upgrade
