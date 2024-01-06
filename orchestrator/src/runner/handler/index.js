const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");
const TestType = require("../enums/TestType");
const TestStatus = require("../enums/TestStatus");

class TestCaseHandler {
  constructor(jobInfo) {
    if (jobInfo != null) {
      switch (jobInfo.type) {
        case TestType.API:
          this._task = new APITestRunner(jobInfo);
          break;
        case TestType.WEB:
          this._task = new WebTestRunner(jobInfo);
          break;
        case TestType.SSH:
          this._task = new SSHTestRunner(jobInfo);
          break;
        default:
          this._task = new DefaultTestRunner(jobInfo);
      }
    }
  }

  async run() {
    if (this._task) {
      logger.info(this._task.toString("Execute Before Hook"));
      try {
        await this._task?.beforeHook();
        await this._task?.before();
        logger.info(this._task.toString("Execute Testcase"));
        await this._task?.execute();
        logger.info(this._task.toString("Execute After Hook"));
      } catch (e) {
        logger.error("Execution failed", e);
        this._task.actual = { error: e.message };
        this._task.result = TestStatus.SKIP;
      }
      try {
        await this._task?.after();
      } catch (e) {
        logger.error("After Hook failed", e);
      }
      try {
        await this._task?.afterHook();
      } catch (e) {
        logger.error("After Hook failed", this._task, e);
      }
    }
  }

  async stop() {
    if (this._task) {
      this._task.interruptTask();
      this._task.stop();
    }
  }

  getStatus() {
    return this._task.result;
  }
}

module.exports = TestCaseHandler;
