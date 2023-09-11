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
  createTestScenario
};

async function create(AccountId, ProjectMasterId, isFlow, payload) {
  if (!AccountId) {
    const account = await global.DbStoreModel.Account.findOne({
      where: {
        role: Role.Admin
      }
    });
    AccountId = account.id;
  }

  let flow;
  if (isFlow) {
    const project = await global.DbStoreModel.ProjectMaster.findByPk(ProjectMasterId);
    if (project.settings) {
      function findNextElements(id) {
        const startNode = project.settings.nodes.find((n) => n.id === id);
        if (startNode) {
          const node = {
            id: startNode.id,
            type: startNode.type,
            children: []
          };
          const elements = {};
          const targets = project.settings.edges.filter((e) => e.source == startNode.id);
          targets.forEach((t) => {
            elements[t.id] = findNextElements(t.target);
          });
          node.children = node.children.concat(Object.values(elements).filter((e) => e != null));
          return node;
        } else {
          return null;
        }
      }
      flow = findNextElements("start");
      if (flow.children.length === 0) flow = null;
    }
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
    flow,
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
