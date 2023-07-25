const { Op, fn, col } = require("sequelize");

module.exports = {
  getRecentBuildSummary,
  getTotalStats,
  getBuildReports,
  getBuildDetails,
  getBuildTrend
};

async function getRecentBuildSummary(AccountId) {
  const suites = await global.DbStoreModel.TestSuite.findAll({
    include: global.DbStoreModel.BuildMaster,
    attributes: ["id", "name"],
    where: {
      AccountId
    },
    order: [["createdAt", "ASC"]]
  });

  const result = [];
  suites.forEach((suite) =>
    suite.BuildMasters.forEach((buildMaster) => {
      if (buildMaster.type === 0)
        result.push({
          ...buildMaster.toJSON(),
          suiteId: suite.id,
          suiteName: suite.name,
          suiteDesc: suite.description
        });
    })
  );
  return result.sort((a, b) => b.buildNo - a.buildNo);
}

async function getTotalStats(AccountId) {
  const suites = await global.DbStoreModel.TestSuite.findAll({
    include: global.DbStoreModel.BuildMaster,
    attributes: ["id"],
    where: {
      AccountId
    }
  });
  const projects = await global.DbStoreModel.ProjectMaster.count({
    where: {
      AccountId
    }
  });
  let builds = 0;
  const suiteIds = suites.map((s) => {
    builds += s.BuildMasters.length;
    return s.id;
  });

  const cases = await global.DbStoreModel.TestCase.count({
    where: {
      AccountId,
      TestSuiteId: {
        [Op.in]: suiteIds
      }
    }
  });
  return {
    projects,
    suites: suites.length,
    cases,
    builds
  };
}

async function getBuildReports(AccountId, ProjectMasterId) {
  const suites = await global.DbStoreModel.TestSuite.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId
    }
  });
  const suiteIds = suites.map((s) => s.id);
  return await global.DbStoreModel.BuildMaster.findAll({
    attributes: [
      "buildNo",
      "type",
      [fn("min", col("startTime")), "startTime"],
      [fn("max", col("endTime")), "endTime"],
      [fn("sum", col("total")), "total"],
      [fn("sum", col("passed")), "passed"],
      [fn("sum", col("failed")), "failed"],
      [fn("sum", col("running")), "running"],
      [fn("sum", col("skipped")), "skipped"]
    ],
    group: ["buildNo", "type"],
    where: {
      TestSuiteId: {
        [Op.in]: suiteIds
      }
    }
  });
}

async function getBuildDetails(AccountId, buildNo) {
  const builds = await global.DbStoreModel.BuildMaster.findAll({
    include: [global.DbStoreModel.TestSuite],
    where: {
      AccountId,
      buildNo
    }
  });

  let total = 0,
    passed = 0,
    failed = 0,
    skipped = 0,
    steps = 0,
    running = 0,
    suites = {},
    buildMap = {},
    jobs = [],
    options = null,
    status = 0,
    startTime,
    endTime;

  builds.forEach((row) => {
    if (row.status > 0) {
      if (row.startTime) {
        row.startTime = new Date(row.startTime);
        if (!startTime || startTime < row.startTime) {
          startTime = row.startTime;
        }
      }
      if (row.endTime) {
        row.endTime = new Date(row.endTime);
        if (!endTime || endTime > row.endTime) {
          endTime = row.endTime;
        }
      }
    }

    buildMap[row.id] = row.TestSuite.id;
    total += Number(row.total);
    passed += Number(row.passed);
    failed += Number(row.failed);
    skipped += Number(row.skipped);
    running += Number(row.running);
    suites[row.TestSuiteId] = row.TestSuite;
    if (row.options) {
      options = row.options;
    }
    if (row.status === 1 || row.status > status) {
      status = row.status;
    }
  });

  const jobRecords = await global.DbStoreModel.Job.findAll({
    include: [global.DbStoreModel.TestCase],
    where: {
      BuildMasterId: {
        [Op.in]: Object.keys(buildMap)
      }
    },
    order: [["id", "ASC"]]
  });

  jobRecords.forEach((j) => {
    const job = j.toJSON();
    const stepsExecuted = (Array.isArray(job.steps) && job.steps.filter((f) => f.result !== 5)) || [];
    if (job.result > 1) steps += stepsExecuted.length;
    jobs.push({
      ...job,
      steps: stepsExecuted.length,
      suiteName: suites[buildMap[job.BuildMasterId]]?.name,
      suiteDesc: suites[buildMap[job.BuildMasterId]]?.description
    });
  });
  const executed = passed + failed + skipped;

  if (status < 6 && (running > 0 || total < executed + running)) {
    status = 1;
  }

  return {
    completion: (executed / total) * 100,
    successRate: (passed / total) * 100,
    total,
    passed,
    failed,
    skipped,
    suites: Object.keys(suites),
    steps,
    running,
    jobs,
    options,
    status,
    startTime,
    endTime
  };
}

async function getBuildTrend(AccountId, limit = 10) {
  return await global.DbStoreModel.BuildMaster.findAll({
    attributes: [
      "buildNo",
      [fn("sum", col("total")), "total"],
      [fn("sum", col("passed")), "passed"],
      [fn("sum", col("failed")), "failed"],
      [fn("sum", col("skipped")), "skipped"],
      [fn("sum", col("running")), "running"]
    ],
    group: ["buildNo"],
    where: {
      AccountId
    },
    order: [["buildNo", "DESC"]],
    limit
  });
}
