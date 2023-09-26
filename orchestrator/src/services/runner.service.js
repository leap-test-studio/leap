const BPromise = require("bluebird");
const BuildManager = require("./job/JobManager");
const { Op } = require("sequelize");
const TestStatus = require("../runner/enums/TestStatus");
const Role = require("../_helpers/role");
const isEmpty = require("lodash/isEmpty");

module.exports = {
  create,
  stop,
  createTestCase,
  createTestScenario,
  triggerSequence
};

function AyncFunc(message) {
  return new Promise(async (resolve) => {
    if (isEmpty(message)) return resolve();
    logger.info(message.id, message.type);
    switch (message.type) {
      case "TC":
        const testCase = await global.DbStoreModel.TestCase.findByPk(message.id);
        logger.info(testCase.toJSON());
        resolve(message);
        break;
      //case "TS":

      //break;
      case "TIMER":
        setTimeout(() => {
          resolve(message);
        }, message?.data?.timer || 0);
        break;
      default:
        resolve(message);
    }
  });
}

async function executeNode(root) {
  if (root == null || root.children == null || root.children.length == 0) return Promise.resolve();
  const result = await BPromise.map(root.children, AyncFunc, { concurrency: 10 });
  const nextElements = {};
  result?.forEach((o) => {
    const element = root.children.find((c) => c.id === o.id);
    element.children?.forEach((c) => {
      nextElements[c.id] = c;
    });
  });
  return executeNode({ children: Object.values(nextElements) });
}

async function triggerSequence(ProjectMasterId) {
  const project = await global.DbStoreModel.ProjectMaster.findByPk(ProjectMasterId);
  if (!project || isEmpty(project.settings)) {
    return;
  }
  function findNextElements(id) {
    const startNode = project.settings.nodes.find((n) => n.id === id);
    if (!startNode) return null;
    const elements = {};
    const targets = project.settings.edges.filter((e) => e.source == startNode.id);
    targets.forEach((t) => {
      elements[t.id] = findNextElements(t.target);
    });
    return {
      id: startNode?.id,
      type: startNode?.type,
      data: startNode?.data,
      children: Object.values(elements).filter((e) => e != null)
    };
  }
  const node = findNextElements("start");
  await executeNode(node);
}

async function create(AccountId, ProjectMasterId, payload) {
  if (!AccountId) {
    const account = await global.DbStoreModel.Account.findOne({
      where: {
        role: Role.Admin
      }
    });
    AccountId = account.id;
  }

  let nextBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
    where: {
      ProjectMasterId,
      type: 0
    }
  });

  if (nextBuildNumber == null) {
    nextBuildNumber = 0;
  }
  nextBuildNumber = Number(nextBuildNumber) + 1;

  const build = new global.DbStoreModel.BuildMaster({
    ...payload,
    type: 0,
    buildNo: nextBuildNumber,
    total: 0,
    status: TestStatus.RUNNING,
    AccountId,
    ProjectMasterId,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  await build.save();

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id", "status"],
    where: {
      ProjectMasterId
    },
    order: [["createdAt", "ASC"]]
  });

  const scenarioIds = testScenarios.filter((scenario) => scenario.id && scenario.status).map((scenario) => scenario.id);

  BPromise.reduce(
    scenarioIds,
    async function (total, TestScenarioId) {
      try {
        const testCases = await global.DbStoreModel.TestCase.findAll({
          where: {
            TestScenarioId,
            type: {
              [Op.not]: 0
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
  )
    .then(async (total) => {
      build.total = total;
      await build.save();
      Promise.resolve(total);
    })
    .catch((e) => Promise.reject(e));
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
    2,
    testCases.map((t) => t.id)
  );
}

function createTestCase(AccountId, ProjectMasterId, type = 1, payload) {
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
            [Op.not]: 0
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
          message: `Test Runner Started. Build No: ${nextBuildNumber}, Total test Cases: ${totalTestCases}`
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
