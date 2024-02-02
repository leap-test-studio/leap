const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");
const { TestStatus, TestType } = require("../../constants");
const JobService = require("../job_service");

class TestHandler {
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

  async start() {
    if (this._task) {
      this._task.on("UPDATE_STATUS", async ({ id, payload }) => {
        try {
          logger.info(this.toString("Uploading Job details: " + JSON.stringify(payload)));
          const job = await JobService.updateJob(id, payload);
          await JobService.consolidate(job.BuildMasterId);
        } catch (error) {
          logger.error("Failed to Update", error);
        }
      });
      this._task.on("CAPTURE_SCREENSHOT", async ({ taskId, ...result }) => {
        await JobService.updateScreenshot(taskId, result);
      });
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

module.exports = TestHandler;
