const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");
const { TestType } = require("../constants");

module.exports = {
  createHandler: (taskInfo) => {
    logger.info("Create Test handler:", JSON.stringify(taskInfo));
    switch (taskInfo.type) {
      case TestType.API:
        return new APITestRunner(taskInfo);
      case TestType.WEB:
        return new WebTestRunner(taskInfo);
      case TestType.SSH:
        return new SSHTestRunner(taskInfo);
      default:
        return new DefaultTestRunner(taskInfo);
    }
  }
};
