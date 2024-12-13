const BPromise = require("bluebird");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const { E_EXEC_STATE, E_TEST_TYPE, E_RUN_TYPE, E_ROLE, BuildTypes } = require("engine_utils");

const { BuildManager } = require("../build_handler");

module.exports = {
    create,
    stop,
    createTestCase,
    createTestScenario
};

function create(AccountId, ProjectMasterId, payload) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!AccountId) {
                const account = await global.DbStoreModel.Account.findOne({
                    where: {
                        role: E_ROLE.Admin
                    }
                });
                AccountId = account.id;
            }
            const testScenarios = await global.DbStoreModel.TestScenario.findAll({
                attributes: ["id", "status"],
                where: {
                    ProjectMasterId
                },
                order: [["createdAt", "ASC"]]
            });

            const suiteIds = testScenarios.filter((scenario) => scenario.id && scenario.status).map((scenario) => scenario.id);
            if (suiteIds.length === 0) {
                return reject("No Test Suite Defined");
            }
            let nextBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
                where: {
                    ProjectMasterId,
                    type: E_RUN_TYPE.PROJECT
                }
            });

            if (nextBuildNumber == null) {
                nextBuildNumber = 0;
            }
            nextBuildNumber = Number(nextBuildNumber) + 1;

            const build = new global.DbStoreModel.BuildMaster({
                ...payload,
                type: E_RUN_TYPE.PROJECT,
                buildNo: nextBuildNumber,
                total: 0,
                status: E_EXEC_STATE.RUNNING,
                AccountId,
                ProjectMasterId,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });

            await build.save();
            const totalTestCases = await BPromise.reduce(
                suiteIds,
                async function (total, TestScenarioId) {
                    try {
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
                        const totalTestCases = testCases.length;
                        if (totalTestCases > 0) {
                            const jobs = await BPromise.reduce(
                                testCases,
                                async (acc, testCase) => {
                                    const job = new global.DbStoreModel.Job({
                                        TestCaseId: testCase.id,
                                        BuildMasterId: build.id,
                                        steps: testCase.execSteps,
                                        createdAt: Date.now()
                                    });
                                    await job.save();
                                    acc.push(job.id);
                                    return acc;
                                },
                                []
                            );
                            BuildManager.emit("addJobs", jobs);
                        }
                        return total + totalTestCases;
                    } catch (error) {
                        logger.error(error);
                        return total;
                    }
                },
                0
            );
            build.total = totalTestCases;
            await build.save();
            resolve({
                totalTestCases,
                buildNumber: nextBuildNumber,
                message: `Test Runner Started. P-${String(nextBuildNumber).padStart(4, "0")}, Total test Cases: ${totalTestCases}`
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function stop(ProjectMasterId) {
    const list = await global.DbStoreModel.BuildMaster.findAll({
        include: global.DbStoreModel.ProjectMaster,
        where: {
            ProjectMasterId,
            status: {
                [Op.in]: [E_EXEC_STATE.DRAFT, E_EXEC_STATE.RUNNING]
            }
        }
    });

    const buildIds = list?.map((o) => o.id);
    await global.DbStoreModel.BuildMaster.update(
        { status: E_EXEC_STATE.ABORT },
        {
            where: {
                id: buildIds
            }
        }
    );

    logger.info("getJobs:", buildIds);
    const jobs = await global.DbStoreModel.Job.findAll({
        where: {
            result: {
                [Op.in]: [E_EXEC_STATE.DRAFT, E_EXEC_STATE.RUNNING]
            },
            BuildMasterId: {
                [Op.in]: buildIds
            }
        }
    });
    const jobIds = jobs?.map((o) => o.id);
    await global.DbStoreModel.Job.update(
        { result: E_EXEC_STATE.ABORT },
        {
            where: {
                id: {
                    [Op.in]: jobIds
                }
            }
        }
    );
    logger.info("Aborting", JSON.stringify(jobIds));
    BuildManager.emit("stopJobs", jobIds);

    return list;
}

async function createTestScenario(AccountId, ProjectMasterId, TestScenarioId) {
    const testCases = await global.DbStoreModel.TestCase.findAll({
        attributes: ["id"],
        where: {
            TestScenarioId,
            enabled: 1
        },
        order: [["seqNo", "ASC"]]
    });

    return createTestCase(
        AccountId,
        ProjectMasterId,
        E_RUN_TYPE.TESTSCENARIO,
        testCases.map((t) => t.id)
    );
}

function createTestCase(AccountId, ProjectMasterId, type = E_RUN_TYPE.TESTCASE, payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let nextBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
                where: {
                    ProjectMasterId,
                    type
                }
            });

            if (nextBuildNumber == null) {
                nextBuildNumber = 0;
            }
            nextBuildNumber = Number(nextBuildNumber) + 1;

            const testCases = await global.DbStoreModel.TestCase.findAll({
                where: {
                    type: {
                        [Op.not]: E_TEST_TYPE.Scenario
                    },
                    enabled: 1,
                    id: {
                        [Op.in]: payload
                    }
                },
                order: [["seqNo", "ASC"]]
            });

            const totalTestCases = testCases.length;
            if (totalTestCases > 0) {
                const build = new global.DbStoreModel.BuildMaster({
                    type,
                    buildNo: nextBuildNumber,
                    total: totalTestCases,
                    status: E_EXEC_STATE.RUNNING,
                    AccountId,
                    ProjectMasterId,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
                await build.save();

                const jobs = await BPromise.reduce(
                    testCases,
                    async (acc, testCase) => {
                        const job = new global.DbStoreModel.Job({
                            TestCaseId: testCase.id,
                            BuildMasterId: build.id,
                            steps: testCase.execSteps,
                            createdAt: Date.now()
                        });
                        await job.save();
                        acc.push(job.id);
                        return acc;
                    },
                    []
                );
                BuildManager.emit("addJobs", jobs);
                resolve({
                    buildNumber: nextBuildNumber,
                    totalTestCases,
                    message: `Test Runner Started. ${BuildTypes[type]}-${String(nextBuildNumber).padStart(4, "0")}${type !== E_RUN_TYPE.TESTCASE ? ", Total test cases: " + totalTestCases : ""}`
                });
            } else {
                resolve({
                    message: "No test cases"
                });
            }
        } catch (e) {
            logger.error(e);
            reject(e);
        }
    });
}
