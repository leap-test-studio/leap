const bluebird = require("bluebird");
const { Op } = require("sequelize");
const { E_TEST_TYPE, E_NODE_STATE, E_EXEC_STATE } = require("engine_utils");

const Task = require("./task");
const { updateJob } = require("../../services/job_service");

class TestSuiteTask extends Task {
    constructor(info) {
        super(info);
    }

    async run() {
        const TestScenarioId = this._data.testSuite;
        const testCases = await global.DbStoreModel.TestCase.findAll({
            where: {
                TestScenarioId,
                type: {
                    [Op.not]: E_TEST_TYPE.Scenario
                },
                enabled: 1
            },
            order: [["seqNo", "ASC"]]
        });

        const result = await bluebird.reduce(
            testCases,
            async (acc, testCase) => {
                const response = await new Promise(async (resolve) => {
                    const runner = await this.executeTestCase(testCase.id, this._data);
                    runner.on("UPDATE_STATUS", async ({ id, payload }) => {
                        try {
                            // logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
                            await updateJob(id, payload);
                            if (payload.result == E_EXEC_STATE.RUNNING) {
                                this.setStatus(E_NODE_STATE.ACTIVE, (acc + 0.1 / testCases.length) * 100);
                            } else if (payload.result == E_EXEC_STATE.PASS || payload.result == E_EXEC_STATE.FAIL) {
                                resolve(payload);
                            }
                        } catch (error) {
                            logger.error("Failed to Update", error);
                        }
                    });
                    await runner.start();
                });
                acc.push(response);
                return acc;
            },
            []
        );
        let pass = 0,
            fail = 0;
        result.forEach((r) => {
            if (r.result == E_EXEC_STATE.PASS) {
                pass++;
            } else {
                fail++;
            }
        });
        if (fail > 0) {
            this.setStatus(E_NODE_STATE.ERRORED);
        } else if (pass === testCases.length) {
            this.setStatus(E_NODE_STATE.COMPLETED);
        }
    }
}

module.exports = TestSuiteTask;
