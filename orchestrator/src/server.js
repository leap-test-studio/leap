global.config = require("./config");
global.config.env = process.env.NODE_ENV === "production" ? "production" : "development";

const logger = require("./logger");
const DbStore = require("./dbStore");
const JobManager = require("./services/scheduler/job.manager");
const BuildManager = require("./services/job/JobManager");
const whiteboard = require("whiteboard-pubsub");
whiteboard.init(global.config.redis);

DbStore.init()
  .then(async (result) => {
    if (result) {
      logger.info("Database Initialized");
      await DbStore.seedUsers();
      await JobManager.load();
      await BuildManager.load();
      require("./index.js");
    } else {
      logger.error("Database Initialization Failed");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
