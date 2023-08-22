const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");
const TestType = require("../enums/TestType");
const TestStatus = require("../enums/TestStatus");

class TestCaseHandler {
  constructor(jobInfo) {
    if (jobInfo != null) {
      switch (jobInfo.TestCase?.type) {
        case TestType.API:
          this.runner = new APITestRunner(jobInfo);
          break;
        case TestType.WEB:
          this.runner = new WebTestRunner(jobInfo);
          break;
        case TestType.SSH:
          this.runner = new SSHTestRunner(jobInfo);
          break;
        default:
          this.runner = new DefaultTestRunner(jobInfo);
      }
    }
  }

  async run() {
    if (this.runner) {
      logger.info(this.runner.toString("Execute Before Hook"));
      try {
        await this.runner?.beforeHook();
        await this.runner?.before();
        logger.info(this.runner.toString("Execute Testcase"));
        await this.runner?.execute();
        logger.info(this.runner.toString("Execute After Hook"));
      } catch (e) {
        logger.error("Execution failed", e);
        this.runner.actual = { error: e.message };
        this.runner.result = TestStatus.SKIP;
      }
      try {
        await this.runner?.after();
      } catch (e) {
        logger.error("After Hook failed", e);
      }
      try {
        await this.runner?.afterHook();
      } catch (e) {
        logger.error("After Hook failed", this.runner, e);
      }
    }
  }

  async stop() {
    if (this.runner) {
      this.runner.skipSteps = true;
      this.runner.stopRunning = true;
      this.runner.stop();
    }
  }
}

module.exports = TestCaseHandler;
