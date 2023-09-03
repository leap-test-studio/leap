const { Op, fn, col } = require("sequelize");

module.exports = {
  getRecentBuildSummary,
  getTotalStats,
  getBuildReports,
  getBuildDetails,
  getBuildTrend
};

async function getRecentBuildSummary(AccountId) {
  const projects = await global.DbStoreModel.ProjectMaster.findAll({
    include: {
      model: global.DbStoreModel.BuildMaster,
      where: {
        type: 0
      }
    },
    attributes: ["id", "name"],
    where: {
      AccountId
    },
    order: [["createdAt", "ASC"]]
  });

  const result = [];
  projects.forEach((project) =>
    project.BuildMasters.forEach((buildMaster) => {
      result.push({
        project,
        ...buildMaster.toJSON()
      });
    })
  );
  return result.sort((a, b) => b.buildNo - a.buildNo);
}

async function getTotalStats(AccountId) {
  const suites = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      AccountId
    }
  });

  const projects = await global.DbStoreModel.ProjectMaster.findAll({
    include: global.DbStoreModel.BuildMaster,
    attributes: ["id"],
    where: {
      AccountId
    }
  });

  let builds = 0;
  projects.map((s) => {
    builds += s.BuildMasters.length;
    return s;
  });

  const suiteIds = suites.map((s) => {
    return s.id;
  });

  const cases = await global.DbStoreModel.TestCase.count({
    where: {
      AccountId,
      TestScenarioId: {
        [Op.in]: suiteIds
      }
    }
  });

  return {
    projects: projects.length,
    suites: suites.length,
    cases,
    builds
  };
}

async function getBuildReports(AccountId, ProjectMasterId) {
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
      ProjectMasterId
    }
  });
}

async function getBuildDetails(id, buildNo) {
  const Project = await global.DbStoreModel.ProjectMaster.findOne({
    include: {
      model: global.DbStoreModel.BuildMaster,
      where: {
        buildNo
      }
    },
    where: {
      id
    }
  });

  let total = 0,
    passed = 0,
    failed = 0,
    skipped = 0,
    steps = 0,
    running = 0,
    suites = {},
    jobs = [],
    options = null,
    status = 0,
    startTime,
    endTime;

  const buildIds = [];
  Project.BuildMasters.forEach((row) => {
    buildIds.push(row.id);
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

    total += Number(row.total);
    passed += Number(row.passed);
    failed += Number(row.failed);
    skipped += Number(row.skipped);
    running += Number(row.running);
    if (row.options) {
      options = row.options;
    }
    if (row.status === 1 || row.status > status) {
      status = row.status;
    }
  });

  const jobRecords = await global.DbStoreModel.Job.findAll({
    include: {
      model: global.DbStoreModel.TestCase,
      include: global.DbStoreModel.TestScenario
    },
    where: {
      BuildMasterId: {
        [Op.in]: buildIds
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
      steps: stepsExecuted.length
    });
    if (job?.TestCase?.TestScenario?.id) suites[job?.TestCase?.TestScenario?.id] = job?.TestCase?.TestScenario;
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

async function getBuildTrend(ProjectMasterId, limit = 10) {
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
      type: 0,
      ProjectMasterId
    },
    order: [["buildNo", "DESC"]],
    limit
  });
}
