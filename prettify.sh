AUTOMATION_HOME=`pwd`;

cd $AUTOMATION_HOME/orchestrator;
npm run prettier:fix &

cd $AUTOMATION_HOME/studio;
npm run prettier:fix &

cd $AUTOMATION_HOME/docs;
npm run dev:prettify &

wait