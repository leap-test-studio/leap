AUTOMATION_HOME=`pwd`
cd $AUTOMATION_HOME/agent
npm run dev:upgrade
cd $AUTOMATION_HOME/orchestrator
npm run dev:upgrade
cd $AUTOMATION_HOME/studio
npm run dev:upgrade
