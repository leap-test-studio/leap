const JobScheduler = require("./scheduler");

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
};

async function getJob(AccountId, ProjectMasterId, id) {
    logger.info(`GetScheduleJob, AccountId:${AccountId}, ProjectMasterId:${ProjectMasterId}, JobId:${id}`);
    return await global.DbStoreModel.ScheduleJob.findOne({
        where: {
            id,
            AccountId,
            ProjectMasterId
        }
    });
}

async function getAllJobs(ProjectMasterId) {
    logger.info(`GetAllScheduleJob, ProjectMasterId:${ProjectMasterId}`);
    return await global.DbStoreModel.ScheduleJob.findAll({
        where: {
            ProjectMasterId
        }
    });
}

async function getJobById(id) {
    logger.info(`GetScheduleJob, JobId:${id}`);
    return await global.DbStoreModel.ScheduleJob.findByPk(id);
}

async function createJob(AccountId, ProjectMasterId, params) {
    logger.info(`CreateScheduleJob, AccountId:${AccountId}, ProjectMasterId:${ProjectMasterId}`);
    const job = new global.DbStoreModel.ScheduleJob({
        AccountId,
        ProjectMasterId,
        ...params
    });
    const result = await job.save();
    if (result != null) {
        result.outcome = await JobScheduler.schedule(result);
    }
    return result;
}

async function updateJob(AccountId, ProjectMasterId, id, params) {
    logger.info(`UpdateScheduleJob, AccountId:${AccountId}, ProjectMasterId:${ProjectMasterId}, JobId:${id}`);
    const job = await getJob(AccountId, ProjectMasterId, id);
    Object.assign(job, params);
    const result = await job.save();
    if (result != null) {
        result.outcome = await JobScheduler.schedule(result);
    }
    return result;
}

async function deleteJob(AccountId, ProjectMasterId, id) {
    logger.info(`DeleteScheduleJob, AccountId:${AccountId}, ProjectMasterId:${ProjectMasterId}, JobId:${id}`);
    const job = await getJob(AccountId, ProjectMasterId, id);
    JobScheduler.stopJob(id);
    return await job.destroy();
}
