AUTOMATION_HOME=`pwd`;

cd $AUTOMATION_HOME/orchestrator;
npm install;
npm run prettier:fix
npm run dev:upgrade

cd $AUTOMATION_HOME/studio;
npm install;
npm run prettier:fix
npm run dev:upgrade
