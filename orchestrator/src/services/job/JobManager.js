const events = require("events");
const { isEmpty } = require("lodash");
const Whiteboard = require("whiteboard-pubsub");
const RedisMan = Whiteboard.RedisMan;
const Runner = require("../../runner/handler");
const jobService = require("./job.service");
const BPromise = require("bluebird");

const REDIS_KEY = Object.freeze({
  JOB_WAITING_QUEUE: "JOB-WAITING-QUEUE",
  JOB_PROCESSING_QUEUE: "JOB-PROCESSING-QUEUE",
  JOB_PROCESSED_QUEUE: "JOB-PROCESSED-QUEUE"
});

class BuildManager extends events.EventEmitter {
  constructor() {
    super();
    this.jobsProcessing = new Set();
    this.on("load", this.load);
    this.on("addJobs", this.addJobs);
    this.on("stopJob", this.stopJob);
    this.on("stopJobs", this.stopJobs);
    this.on("process", this.run);
    this.TestCasehandlers = {};
  }

  async load() {
    this.jobsProcessing.clear();
    const jobs = await global.DbStoreModel.Job.findAll({
      attributes: ["id"],
      where: { result: 0 },
      order: [["id", "ASC"]]
    });
    if (Array.isArray(jobs)) {
      const connection = await RedisMan.getConnection();
      await connection.del(REDIS_KEY.JOB_PROCESSED_QUEUE);
      await connection.del(REDIS_KEY.JOB_PROCESSING_QUEUE);
      const queueSize = await connection.llen(REDIS_KEY.JOB_WAITING_QUEUE);
      const waitingList = await connection.lrange(REDIS_KEY.JOB_WAITING_QUEUE, 0, queueSize);
      logger.info("WaitingList", waitingList);
      await this.addJobs(
        jobs
          .map((j) => {
            if (!waitingList.includes(j.id)) return j.id;
          })
          .filter(function (el) {
            return el != null;
          })
      );
    }
    this.timer = setInterval(() => this.emit("process"), 5000);
  }

  async addJobs(o) {
    try {
      if (!isEmpty(o)) {
        logger.info("Enqueue JOB to Waiting List:", o, ", Records:", o.length);
        const connection = await RedisMan.getConnection();
        const len = await connection.rpush(REDIS_KEY.JOB_WAITING_QUEUE, ...o);
        logger.info("Total Jobs enqueued to Waiting List:", len);
      }
    } catch (error) {
      logger.error("Failed to Enqueue ", o, error);
    }
  }

  async stopJobs(jobs) {
    logger.trace(`BUILD_MAN: Stopping Jobs[${jobs}]`);
    await BPromise.reduce(
      jobs,
      async (accumulator, jobId) => {
        await this.stopJob(jobId);
        return accumulator;
      },
      []
    );
  }

  async stopJob(jobId) {
    try {
      logger.trace(`BUILD_MAN: Stopping Job[${jobId}]`);
      const connection = await RedisMan.getConnection();
      await connection.lrem(REDIS_KEY.JOB_WAITING_QUEUE, 1, jobId);
      if (this.TestCasehandlers[jobId] != null) {
        await this.TestCasehandlers[jobId].stop();
        delete this.TestCasehandlers[jobId];
      }
      await connection.lrem(REDIS_KEY.JOB_PROCESSING_QUEUE, 1, jobId);
      await connection.rpush(REDIS_KEY.JOB_PROCESSED_QUEUE, jobId);
      this.jobsProcessing.delete(jobId);
      logger.trace(`BUILD_MAN: Stopped Job[${jobId}]`);
    } catch (error) {
      logger.error("Failed to delete", jobId, error);
    }
  }

  async run() {
    try {
      const connection = await RedisMan.getConnection();
      const queueSize = await connection.llen(REDIS_KEY.JOB_WAITING_QUEUE);
      //logger.trace(`BUILD_MAN: QueueSize[${queueSize}]`);
      if (queueSize > 0) {
        const jobId = (await connection.lrange(REDIS_KEY.JOB_WAITING_QUEUE, 0, 0))[0];
        logger.trace(`BUILD_MAN: HEAD[${jobId}] ${Array.from(this.jobsProcessing.keys()).join(", ")} ${this.jobsProcessing.has(jobId)}`);
        if (jobId != null && !this.jobsProcessing.has(jobId)) {
          try {
            logger.trace(`BUILD_MAN: PROCESSING[${jobId}]`);
            await connection.rpush(REDIS_KEY.JOB_PROCESSING_QUEUE, jobId);
            const job = await jobService.getJobInfo(jobId);
            this.TestCasehandlers[jobId] = new Runner(job);
            this.jobsProcessing.add(jobId);
            await this.TestCasehandlers[jobId].run();
            if (this.TestCasehandlers[jobId]?.runner?.result > 1) {
              await this.stopJob(jobId);
            }
          } catch (error) {
            logger.error("BUILD_MAN: ERRORED-", error);
          }
        }
      }
    } catch (error) {
      logger.error("Failed to Process Job", error);
    }
  }
}

module.exports = new BuildManager();
