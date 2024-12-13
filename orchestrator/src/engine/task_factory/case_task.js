const Task = require("./task");
const { updateScreenshot, updateJob } = require("../../services/job_service");
const { E_EXEC_STATE, E_NODE_STATE } = require("engine_utils");

class TestCaseTask extends Task {
    constructor(info) {
        super(info);
    }

    async run() {
        super.run();
        const runner = await this.executeTestCase(this._data.testCase, this._data);

        runner.on("UPDATE_STATUS", async ({ id, payload }) => {
            try {
                // logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
                await updateJob(id, payload);
                if (payload.result == E_EXEC_STATE.RUNNING) {
                    this.setStatus(E_NODE_STATE.ACTIVE, 50);
                } else if (payload.result == E_EXEC_STATE.PASS) {
                    this.setStatus(E_NODE_STATE.COMPLETED);
                } else if (payload.result == E_EXEC_STATE.FAIL) {
                    this.setStatus(E_NODE_STATE.ERRORED);
                }
            } catch (error) {
                logger.error("Failed to Update", error);
            }
        });
        await runner.start();
    }
}

module.exports = TestCaseTask;
