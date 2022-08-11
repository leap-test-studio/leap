VINASHAK_HOME=`pwd`
cd $VINASHAK_HOME/agent
npm run prettier:fix
cd $VINASHAK_HOME/orchestrator
npm run prettier:fix
cd $VINASHAK_HOME/studio
npm run prettier:fix
