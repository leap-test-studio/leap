global.config = require("./config");
global.config.env = process.env.NODE_ENV === "production" ? "production" : "development";

const fs = require("fs");
const whiteboard = require("whiteboard-pubsub");
whiteboard.init(global.config.redis);

const logger = require("./logger");
const DbStore = require("./dbStore");
const JobScheduler = require("./services/scheduler");
const { BuildManager } = require("./build_handler");

if (!fs.existsSync("tmp")) {
  fs.mkdirSync("tmp");
}
DbStore.init()
  .then(async (result) => {
    if (result) {
      logger.info("Database Initialized");
      await DbStore.seedUsers();
      await JobScheduler.load();
      await BuildManager.load();
      require("./index");
    } else {
      logger.error("Database Initialization Failed");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
