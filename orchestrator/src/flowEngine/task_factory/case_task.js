const Task = require("./task");
const TaskHandler = require("../../task_handler");
const { getSettingsByTestId } = require("../../services/job_service");

class TestCaseTask extends Task {
  constructor(info) {
    super(info);
  }

  run() {
    return new Promise(async (resolve) => {
      const testcase = await getSettingsByTestId(this._data.id);
      this._data = {
        BuildMasterId: this._instanceId,
        ...this._data,
        ...testcase
      };

      const runner = TaskHandler.createHandler(this._data);
      runner.on("UPDATE_STATUS", async (response) => {
        try {
          logger.info(runner.toString("Uploading Job details: " + JSON.stringify(response)));
        } catch (error) {
          logger.error("Failed to Update", error);
        }
      });

      runner.on("CAPTURE_SCREENSHOT", async (captureData) => {
        logger.info(runner.toString("CaptureData"));
      });

      await runner.start();
      resolve({ done: true, async: true });
    });
  }
}

module.exports = TestCaseTask;
