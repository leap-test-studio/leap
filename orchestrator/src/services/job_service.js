const sequelize = require("sequelize");
const { Op } = require("sequelize");

const { TestStatus } = require("../constants");

module.exports = {
  getJobInfo,
  updateJob,
  updateBuild,
  updateBuildStatus: _updateBuildStatus,
  consolidate,
  updateScreenshot,
  getSettingsByTestId
};

async function getSettingsByTestId(id) {
  try {
    logger.trace(`Get Job Settings, JobID:${id}`);
    const obj = await global.DbStoreModel.TestCase.findOne({
      attributes: ["execSteps", "settings", "type", "seqNo"],
      include: {
        attributes: ["settings"],
        model: global.DbStoreModel.TestScenario,
        include: {
          attributes: ["settings"],
          model: global.DbStoreModel.ProjectMaster
        }
      },
      where: { id },
      raw: true,
      nest: true
    });

    let settings = {
      ...obj.settings,
      ...obj.TestScenario.settings,
      ...obj.TestScenario.ProjectMaster.settings
    };

    const env = settings.env;

    if (obj.execSteps === null) obj.execSteps = [];
    if (env) {
      obj.execSteps = JSON.stringify(obj.execSteps);
      settings = JSON.stringify(settings);
      env.forEach(({ key, value }) => {
        obj.execSteps = obj.execSteps.replaceAll(`\${${key}}`, value);
        settings = settings.replaceAll(`\${${key}}`, value);
      });
      obj.execSteps = JSON.parse(obj.execSteps);
      settings = JSON.parse(settings);
    }

    return {
      ...obj,
      settings,
      env
    };
  } catch (error) {
    logger.error(error);
  }
  return {};
}

async function getJobInfo(id) {
  logger.trace("Get JobInfo By ID:", id);
  let jobInfo = await global.DbStoreModel.Job.findByPk(id);
  if (!jobInfo) throw new Error(`Job ID:${id} not found`);
  Object.assign(jobInfo, await getSettingsByTestId(jobInfo.TestCaseId));
  return jobInfo;
}

async function getBuildInfo(id, include) {
  const buildInfo = await global.DbStoreModel.BuildMaster.findOne({
    include,
    where: { id }
  });
  if (!buildInfo) throw new Error(`Build ID:${id} not found`);
  return buildInfo;
}

async function updateJob(id, params) {
  const job = await getJobInfo(id);
  Object.assign(job, params);
  job.changed("updatedAt", true);
  job.updatedAt = new Date();
  return await job.save();
}

async function updateScreenshot(id, payload) {
  const job = await getJobInfo(id);
  if (!job.screenshot) job.screenshot = [];
  job.screenshot = [...job.screenshot, payload];
  job.changed("updatedAt", true);
  job.updatedAt = new Date();
  return await job.save();
}

async function consolidate(buildId) {
  try {
    logger.info("Consolidate results for", buildId);
    const minmax = await global.DbStoreModel.Job.findAll({
      attributes: [
        [sequelize.fn("MIN", sequelize.col("startTime")), "MIN"],
        [sequelize.fn("MAX", sequelize.col("endTime")), "MAX"]
      ],
      where: {
        BuildMasterId: buildId,
        result: {
          [Op.not]: TestStatus.DRAFT
        }
      },
      raw: true
    });

    let startTime, endTime;

    minmax.forEach((r) => {
      startTime = r.MIN;
      endTime = r.MAX;
    });

    const results = await global.DbStoreModel.Job.findAll({
      attributes: ["result", [sequelize.fn("COUNT", sequelize.col("id")), "Count"]],
      where: {
        BuildMasterId: buildId
      },
      group: ["result"],
      raw: true
    });

    let total = 0,
      status = 0,
      rmap = {};

    results.forEach((r) => {
      rmap[r.result] = Number(rmap[r.result] || 0) + Number(r.Count);
      total += Number(r.Count);
    });

    const draft = rmap[TestStatus.DRAFT] || 0,
      passed = rmap[TestStatus.PASS] || 0,
      failed = rmap[TestStatus.FAIL] || 0,
      skipped = rmap[TestStatus.SKIP] || 0,
      running = rmap[TestStatus.RUNNING] || 0;
    logger.trace("rmap", rmap);
    const sum = passed + failed + skipped + running;

    if (running > 0 || draft > 0) {
      status = TestStatus.RUNNING;
    } else if (sum === passed) {
      status = TestStatus.PASS;
    } else if (failed > 0) {
      status = TestStatus.FAIL;
    }

    await _updateBuildStatus(buildId, { total, passed, failed, skipped, running, startTime, endTime, status });
  } catch (error) {
    logger.error(error);
  }
}

async function _updateBuildStatus(id, params) {
  logger.trace("Update Build Status", id, params);
  const build = await getBuildInfo(id);
  Object.assign(build, params);
  build.changed("updatedAt", true);
  build.updatedAt = Date.now();
  return await build.save();
}

async function updateBuild(id) {
  const build = await getBuildInfo(id, [global.DbStoreModel.Job]);

  let total = 0,
    skipped = 0,
    failed = 0,
    passed = 0;
  build.Jobs.forEach((job) => {
    total++;
    switch (job.result) {
      case TestStatus.PASS:
        passed++;
        break;
      case TestStatus.FAIL:
        failed++;
        break;
      case TestStatus.RUNNING:
        break;
      default:
        logger.info("Job details", job.id, job.result);
        skipped++;
    }
  });
  build.status = failed > 0 ? TestStatus.FAIL : TestStatus.PASS;
  build.total = total;
  build.passed = passed;
  build.failed = failed;
  build.skipped = skipped;
  build.updatedAt = Date.now();
  build.endTime = Date.now();
  return await build.save();
}
