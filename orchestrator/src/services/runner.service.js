const BPromise = require("bluebird");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");

const { executeSequence, BuildManager } = require("../build_handler");
const { TestStatus, RUN_TYPE, TestType } = require("../constants");
const Role = require("../_helpers/role");

module.exports = {
  create,
  stop,
  createTestCase,
  createTestScenario,
  triggerSequence
};

async function triggerSequence(ProjectMasterId) {
  const project = await global.DbStoreModel.ProjectMaster.findByPk(ProjectMasterId);
  if (!project || isEmpty(project.settings)) {
    return;
  }
  executeSequence(project.toJSON());
}

function create(AccountId, ProjectMasterId, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!AccountId) {
        const account = await global.DbStoreModel.Account.findOne({
          where: {
            role: Role.Admin
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

      const scenarioIds = testScenarios.filter((scenario) => scenario.id && scenario.status).map((scenario) => scenario.id);
      if (scenarioIds.length === 0) {
        return reject("No Test Scenario Defined");
      }
      let nextBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
        where: {
          ProjectMasterId,
          type: RUN_TYPE.PROJECT
        }
      });

      if (nextBuildNumber == null) {
        nextBuildNumber = 0;
      }
      nextBuildNumber = Number(nextBuildNumber) + 1;

      const build = new global.DbStoreModel.BuildMaster({
        ...payload,
        type: RUN_TYPE.PROJECT,
        buildNo: nextBuildNumber,
        total: 0,
        status: TestStatus.RUNNING,
        AccountId,
        ProjectMasterId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      await build.save();
      const totalTestCases = await BPromise.reduce(
        scenarioIds,
        async function (total, TestScenarioId) {
          try {
            const testCases = await global.DbStoreModel.TestCase.findAll({
              where: {
                TestScenarioId,
                type: {
                  [Op.not]: TestType.Scenario
                },
                enabled: true
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
        [Op.in]: [TestStatus.DRAFT, TestStatus.RUNNING]
      }
    }
  });

  if (!isEmpty(list)) {
    const buildIds = list?.map((o) => o.id);
    await global.DbStoreModel.BuildMaster.update(
      { status: TestStatus.ABORT },
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
          [Op.in]: [TestStatus.DRAFT, TestStatus.RUNNING]
        },
        BuildMasterId: {
          [Op.in]: buildIds
        }
      }
    });
    const jobIds = jobs?.map((o) => o.id);
    await global.DbStoreModel.Job.update(
      { result: TestStatus.ABORT },
      {
        where: {
          id: {
            [Op.in]: jobIds
          }
        }
      }
    );
    logger.info("Aborting", jobIds);
    BuildManager.emit("stopJobs", jobIds);
  }

  return list;
}

async function createTestScenario(AccountId, ProjectMasterId, TestScenarioId) {
  const testCases = await global.DbStoreModel.TestCase.findAll({
    attributes: ["id"],
    where: {
      TestScenarioId,
      enabled: true
    },
    order: [["seqNo", "ASC"]]
  });

  return createTestCase(
    AccountId,
    ProjectMasterId,
    RUN_TYPE.TESTSCENARIO,
    testCases.map((t) => t.id)
  );
}

function createTestCase(AccountId, ProjectMasterId, type = RUN_TYPE.TESTCASE, payload) {
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
            [Op.not]: TestType.Scenario
          },
          enabled: true,
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
          status: TestStatus.RUNNING,
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
          message: `Test Runner Started. ${type === RUN_TYPE.TESTCASE ? "TC" : "TS"}-${String(nextBuildNumber).padStart(4, "0")}${type !== RUN_TYPE.TESTCASE ? ", Total test cases: " + totalTestCases : ""}`
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
