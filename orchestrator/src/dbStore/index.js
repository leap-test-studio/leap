const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = global.config.DBstore;
const colors = require("colors");

global.DbStoreModel = {};
module.exports = {
  init: () => {
    logger.info("Initializing the DbStore");

    return new Promise(async (resolve) => {
      try {
        const basename = path.basename(module.filename);
        const dbDir = path.join(__dirname, "models");

        const sequelize = new Sequelize(config.database, config.username, config.password, config);
        await sequelize.authenticate();
        if (logger.isTraceEnabled()) {
          logger.trace("Connection has been established successfully.");
        }

        fs.readdirSync(dbDir)
          .filter((file) => {
            return file.indexOf(".") != 0 && file != basename;
          })
          .forEach((file) => {
            if (file.slice(-3) != ".js") {
              return;
            }
            const filepath = path.join(dbDir, file);
            if (logger.isTraceEnabled()) {
              logger.trace("Importing model file: " + filepath);
            }
            const model = require(filepath)(sequelize, Sequelize.DataTypes);
            global.DbStoreModel[model.name] = model;
          });

        Object.keys(global.DbStoreModel).forEach(function (modelName) {
          if (global.DbStoreModel[modelName].associate) {
            global.DbStoreModel[modelName].associate(global.DbStoreModel);
          }
        });

        global.DbStoreModel.sequelize = sequelize;
        await global.DbStoreModel.sequelize.sync();
        const result = await global.DbStoreModel.sequelize.query("SELECT 1");

        if (logger.isInfoEnabled()) {
          logger.info("Database Test:", result?.length > 0 ? colors.green("Pass") : colors.red("Fail"));
        }
        resolve(result);
      } catch (e) {
        logger.error("Failed to sync DbStore", e);
        resolve(null);
      }
    });
  },
  Sequelize
};
