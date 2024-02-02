const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");
const { TestType } = require("../../constants");

module.exports = {
  createHandler: (jobInfo) => {
    switch (jobInfo.type) {
      case TestType.API:
        return new APITestRunner(jobInfo);
      case TestType.WEB:
        return new WebTestRunner(jobInfo);
      case TestType.SSH:
        return new SSHTestRunner(jobInfo);
      default:
        return new DefaultTestRunner(jobInfo);
    }
  }
};
