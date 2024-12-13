const sequelize = require("sequelize");
const { Op } = require("sequelize");
const merge = require("lodash/merge");
const { E_EXEC_STATE } = require("engine_utils");

module.exports = {
    getJobInfo,
    updateJob,
    updateBuild,
    updateBuildStatus: _updateBuildStatus,
    consolidate,
    updateScreenshot,
    getSettingsByTestId,
    getBuildInfo
};

async function getSettingsByTestId(BuildMasterId, id) {
    try {
        logger.trace(`Get Job Settings, JobID:${id}`);
        const obj = await global.DbStoreModel.TestCase.findOne({
            attributes: ["id", "execSteps", "settings", "type", "seqNo"],
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

        let settings = {};

        merge(settings, obj.TestScenario.ProjectMaster.settings);
        merge(settings, obj.TestScenario.settings);
        merge(settings, obj.settings);

        if (BuildMasterId) {
            const buildInfo = await global.DbStoreModel.BuildMaster.findOne({
                attributes: ["options"],
                where: { id: BuildMasterId },
                raw: true,
                nest: true
            });
            merge(settings, buildInfo.options);
        }

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
    Object.assign(jobInfo, await getSettingsByTestId(jobInfo.BuildMasterId, jobInfo.TestCaseId));
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
                    [Op.not]: E_EXEC_STATE.DRAFT
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

        const draft = rmap[E_EXEC_STATE.DRAFT] || 0,
            passed = rmap[E_EXEC_STATE.PASS] || 0,
            failed = rmap[E_EXEC_STATE.FAIL] || 0,
            skipped = rmap[E_EXEC_STATE.SKIP] || 0,
            running = rmap[E_EXEC_STATE.RUNNING] || 0;
        const sum = passed + failed + skipped + running;

        if (running > 0 || draft > 0) {
            status = E_EXEC_STATE.RUNNING;
        } else if (sum === passed) {
            status = E_EXEC_STATE.PASS;
        } else if (failed > 0 || (passed === 0 && failed === 0 && skipped > 0)) {
            status = E_EXEC_STATE.FAIL;
        }
        await _updateBuildStatus(buildId, { total, passed, failed, skipped, running, startTime, endTime, status });
    } catch (error) {
        logger.error(error);
    }
}

async function _updateBuildStatus(id, params) {
    logger.trace("Update Build Status", id, JSON.stringify(params));
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
            case E_EXEC_STATE.PASS:
                passed++;
                break;
            case E_EXEC_STATE.FAIL:
                failed++;
                break;
            case E_EXEC_STATE.RUNNING:
                break;
            default:
                logger.info("Job details", job.id, job.result);
                skipped++;
        }
    });
    build.status = failed > 0 ? E_EXEC_STATE.FAIL : E_EXEC_STATE.PASS;
    build.total = total;
    build.passed = passed;
    build.failed = failed;
    build.skipped = skipped;
    build.updatedAt = Date.now();
    build.endTime = Date.now();
    return await build.save();
}
