const Task = require("./task");
const TaskHandler = require("../../task_handler");
const { getSettingsByTestId } = require("../../services/job_service");

class TestCaseTask extends Task {
  constructor(info) {
    super(info);
  }

  run() {
    return new Promise(async (resolve) => {
      const job = await getSettingsByTestId("3e79dab5-44e2-4507-a905-9a9ffba5121a");
      const jobInfo = {
        id: 97,
        BuildMasterId: "ce00342b-3b47-4a91-9fd5-8dec41deae0f",
        TestCaseId: "3e79dab5-44e2-4507-a905-9a9ffba5121a",
        actual: null,
        result: 0,
        screenshot: null,
        extras: {},
        ...job
      };

      console.log("TEST CASE", JSON.stringify(jobInfo));
      const runner = TaskHandler.createHandler(jobInfo);
      runner.on("UPDATE_STATUS", async ({ id, payload }) => {
        try {
          logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
        } catch (error) {
          logger.error("Failed to Update", error);
        }
      });

      runner.on("CAPTURE_SCREENSHOT", async ({ taskId, ...result }) => {});

      await runner.start();
      resolve({ done: true, async: true });
    });
  }
}

module.exports = TestCaseTask;
