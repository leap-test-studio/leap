const JobManager = require("./job.manager");

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};

async function getJob(AccountId, ProjectMasterId, id) {
  return await global.DbStoreModel.ScheduleJob.findOne({
    where: {
      id,
      AccountId,
      ProjectMasterId
    }
  });
}

async function getAllJobs(ProjectMasterId) {
  return await global.DbStoreModel.ScheduleJob.findAll({
    where: {
      ProjectMasterId
    }
  });
}

async function getJobById(id) {
  return await global.DbStoreModel.ScheduleJob.findByPk(id);
}

async function createJob(AccountId, ProjectMasterId, params) {
  const job = new global.DbStoreModel.ScheduleJob({
    AccountId,
    ProjectMasterId,
    ...params
  });
  const result = await job.save();
  if (result != null) {
    result.outcome = await JobManager.schedule(result);
  }
  return result;
}

async function updateJob(AccountId, ProjectMasterId, id, params) {
  const job = await getJob(AccountId, ProjectMasterId, id);
  Object.assign(job, params);
  const result = await job.save();
  if (result != null) {
    result.outcome = await JobManager.schedule(result);
  }
  return result;
}

async function deleteJob(AccountId, ProjectMasterId, id) {
  const job = await getJob(AccountId, ProjectMasterId, id);
  JobManager.stopJob(id);
  return await job.destroy();
}
