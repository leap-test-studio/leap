const Cron = require("node-cron");
const BPromise = require("bluebird");
const isEmpty = require("lodash/isEmpty");
const IP = require("ip");
const Transport = require("./transports");
const JobService = require("../job/job.service");
const TestStatus = require("../../runner/enums/TestStatus");

const RunningTasks = {};

module.exports = {
  load,
  schedule,
  stopJob,
  restartJob
};

async function load() {
  try {
    logger.info(`JOB_MAN[LOAD]: Reloading Scheduler Jobs`);
    const jobs = await global.DbStoreModel.ScheduleJob.findAll({
      where: {
        status: TestStatus.RUNNING
      }
    });

    const result = await BPromise.reduce(jobs, executor, []);
    logger.info(`JOB_MAN[LOAD]: Response: ${result}`);
  } catch (error) {
    logger.error(`JOB_MAN[LOAD]: error: ${error.message}`);
  }
}

async function callbackHandler(job) {
  const jobId = job?.id;

  const jobLog = new global.DbStoreModel.ScheduleJobLog({
    machine: IP.address(),
    start_time: new Date(),
    result: "Start",
    ScheduleJobId: jobId
  });
  try {
    await jobLog.save();
    await JobService.create(job.AccountId, job.callback.message, {});
    logger.info(`JOB_MAN[${jobId}]: Executing Callback-${job.callback.type} - ${job.name}`);
    switch (job.callback.type) {
      case "kafka":
      case "http":
      case "redis":
        const response = await Transport(job);
        logger.trace(`JOB_MAN[${jobId}]: Callback response`);
        jobLog.result = response !== null ? "Completed" : "Failed";
        logger.info(`JOB_MAN[${jobId}]: Completed Callback - ${job.name}`);
        break;
      default:
        jobLog.result = "Invalid callback";
    }
  } catch (error) {
    jobLog.result = "Failed";
    logger.error(`JOB_MAN[${jobId}]: Failed Callback, error:${error.message}`);
  } finally {
    jobLog.end_time = new Date();
    await jobLog.save();
  }
}

function stopJob(jobId) {
  if (RunningTasks.hasOwnProperty(jobId)) {
    logger.info(`JOB_MAN[${jobId}]: Stopping the Job`);
    RunningTasks[jobId].stop();
    delete RunningTasks[jobId];
    logger.info(`JOB_MAN[${jobId}]: Stopped the Job`);
  }
}

async function restartJob(jobId) {
  stopJob(jobId);
  const job = await global.DbStoreModel.ScheduleJob.findByPk(jobId);
  if (job.status === 1) {
    if (Cron.validate(job.cron_setting)) {
      logger.info(`JOB_MAN[${jobId}]: Valid cron expression, Expression:${job.cron_setting}`);
      const task = Cron.schedule(job.cron_setting, () => callbackHandler(job));
      RunningTasks[jobId] = task;
      logger.info(`JOB_MAN[${jobId}]: Job Scheduled Successfully`);
      return Promise.resolve({
        id: job.id,
        message: "Successfully scheduled"
      });
    } else {
      logger.error(`JOB_MAN[${jobId}]: Invalid cron expression, Expression:${job.cron_setting}`);
      return Promise.resolve({
        id: job.id,
        error: "Invalid Cron Setting"
      });
    }
  }
}

async function schedule(job) {
  const jobId = job?.id;
  try {
    if (!isEmpty(job?.callback)) {
      logger.info(`JOB_MAN[${jobId}]: Scheduling the Job ${job.name}`);
      return await restartJob(jobId);
    } else {
      logger.error(`JOB_MAN[${jobId}]: Callback is not configured, Job: ${job}`);
      return Promise.resolve({
        id: jobId,
        error: "Invalid job"
      });
    }
  } catch (error) {
    logger.error(`JOB_MAN[${jobId}]: Callback in not configured, error: ${error.message}`);
    return Promise.resolve({
      id: job.id,
      error: "Failed to process job, error: " + error.message
    });
  }
}

async function executor(accumulator, job) {
  const res = await schedule(job);
  return [...accumulator, res !== null && res.message];
}
