const BPromise = require("bluebird");
const BuildManager = require("./job/JobManager");
const { Op } = require("sequelize");
const TestStatus = require("../runner/enums/TestStatus");
const { isEmpty } = require("lodash");

module.exports = {
  create,
  stop,
  createTestCase
};

async function create(AccountId, ProjectMasterId, payload) {
  const testSuites = await global.DbStoreModel.TestSuite.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId,
      status: {
        [Op.not]: TestStatus.DRAFT
      }
    },
    order: [["createdAt", "ASC"]]
  });

  const testSuiteIds = testSuites.map((suite) => suite.id);

  const lastBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
    where: {
      type: 0
    }
  });

  BPromise.reduce(
    testSuiteIds,
    async function (total, TestSuiteId) {
      try {
        const testCases = await global.DbStoreModel.TestCase.findAll({
          where: {
            TestSuiteId,
            type: {
              [Op.not]: 0
            },
            enabled: true
          },
          order: [["seqNo", "ASC"]]
        });
        const totalTestCases = testCases.length;
        if (totalTestCases > 0) {
          const build = new global.DbStoreModel.BuildMaster({
            ...payload,
            buildNo: lastBuildNumber + 1,
            type: 0,
            total: totalTestCases,
            status: TestStatus.RUNNING,
            AccountId,
            TestSuiteId,
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
        }
        return total + totalTestCases;
      } catch (error) {
        logger.error(error);
        return total;
      }
    },
    0
  ).then(function (total) {
    Promise.resolve(total);
  });
}

async function stop(ProjectMasterId) {
  const list = await global.DbStoreModel.BuildMaster.findAll({
    include: {
      model: global.DbStoreModel.TestSuite,
      where: {
        ProjectMasterId
      }
    },
    where: {
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

async function createTestCase(AccountId, id) {
  const tc = await global.DbStoreModel.TestCase.findOne({
    include: global.DbStoreModel.TestSuite,
    where: {
      id,
      AccountId
    }
  });

  const testSuiteIds = [tc.TestSuite.id];
  const lastBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
    where: {
      AccountId,
      type: 1
    }
  });

  return await BPromise.reduce(
    testSuiteIds,
    async function (accumulator, TestSuiteId) {
      try {
        const build = new global.DbStoreModel.BuildMaster({
          buildNo: lastBuildNumber + 1,
          type: 1,
          total: 1,
          status: TestStatus.RUNNING,
          AccountId,
          TestSuiteId,
          options: {
            testCases: [id]
          },
          ProjectMasterId: tc.TestSuite.ProjectMasterId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        const result = await build.save();
        return [...accumulator, result.id];
      } catch (error) {
        logger.error(error);
        return accumulator;
      }
    },
    []
  );
}
