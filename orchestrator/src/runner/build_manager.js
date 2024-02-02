const events = require("events");
const BPromise = require("bluebird");
const isEmpty = require("lodash/isEmpty");
const Whiteboard = require("whiteboard-pubsub");
const RedisMan = Whiteboard.RedisMan;

const Runner = require("./handler");
const jobService = require("./job.service");
const { TestStatus } = require("../constants");

const REDIS_KEY = Object.freeze({
  JOB_WAITING_QUEUE: "JOB-WAITING-QUEUE",
  JOB_PROCESSING_QUEUE: "JOB-PROCESSING-QUEUE",
  JOB_PROCESSED_QUEUE: "JOB-PROCESSED-QUEUE"
});

class BuildManager extends events.EventEmitter {
  constructor() {
    super();
    this._handlers = {};
    this._jobs_processing = new Set();

    this.on("addJobs", this._addJobs);
    this.on("stopJob", this._stopJob);
    this.on("stopJobs", this._stopJobs);
    this.on("process", this._run);
  }

  async load() {
    this._jobs_processing.clear();
    logger.info("Load jobs");
    const jobs = await global.DbStoreModel.Job.findAll({
      attributes: ["id"],
      where: { result: TestStatus.DRAFT }
    });
    if (Array.isArray(jobs)) {
      const connection = await RedisMan.getConnection();
      await connection.del(REDIS_KEY.JOB_PROCESSED_QUEUE);
      await connection.del(REDIS_KEY.JOB_PROCESSING_QUEUE);
      const queueSize = await connection.llen(REDIS_KEY.JOB_WAITING_QUEUE);
      const waitingList = [...new Set(await connection.lrange(REDIS_KEY.JOB_WAITING_QUEUE, 0, queueSize))];
      logger.info("WaitingList", waitingList);
      await this._addJobs(
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

  async _addJobs(o) {
    try {
      if (!isEmpty(o)) {
        logger.info("Enqueue JOB to Waiting List:", o, ", Records:", o.length);
        const connection = await RedisMan.getConnection();
        const len = await connection.rpush(REDIS_KEY.JOB_WAITING_QUEUE, ...new Set(o));
        logger.info("Total Jobs enqueued to Waiting List:", len);
      }
    } catch (error) {
      logger.error("Failed to Enqueue ", o, error);
    }
  }

  async _stopJobs(jobs) {
    logger.trace(`BUILD_MAN: Stopping Jobs[${jobs}]`);
    await BPromise.reduce(
      jobs,
      async (accumulator, jobId) => {
        await this._stopJob(jobId);
        return accumulator;
      },
      []
    );
  }

  async _stopJob(jobId) {
    try {
      logger.trace(`BUILD_MAN: Stopping Job[${jobId}]`);
      const connection = await RedisMan.getConnection();
      await connection.lrem(REDIS_KEY.JOB_WAITING_QUEUE, 1, jobId);
      if (this._handlers[jobId] != null) {
        try {
          await this._handlers[jobId].stop();
        } catch (error) {
          loggger.error("Failed to stop", error);
        }
        delete this._handlers[jobId];
      }
      await connection.lrem(REDIS_KEY.JOB_PROCESSING_QUEUE, 1, jobId);
      await connection.rpush(REDIS_KEY.JOB_PROCESSED_QUEUE, jobId);
      this._jobs_processing.delete(jobId);
      logger.trace(`BUILD_MAN: Stopped Job[${jobId}]`);
    } catch (error) {
      logger.error("Failed to delete", jobId, error);
    }
  }

  async _run() {
    try {
      const connection = await RedisMan.getConnection();
      const queueSize = await connection.llen(REDIS_KEY.JOB_WAITING_QUEUE);
      //logger.trace(`BUILD_MAN: QueueSize[${queueSize}]`);
      if (queueSize > 0) {
        const jobId = (await connection.lrange(REDIS_KEY.JOB_WAITING_QUEUE, 0, 0))[0];
        logger.trace(`BUILD_MAN: HEAD[${jobId}] ${Array.from(this._jobs_processing.keys()).join(", ")} ${this._jobs_processing.has(jobId)}`);
        if (jobId != null && !this._jobs_processing.has(jobId)) {
          try {
            logger.trace(`BUILD_MAN: PROCESSING[${jobId}]`);
            await connection.rpush(REDIS_KEY.JOB_PROCESSING_QUEUE, jobId);
            const job = await jobService.getJobInfo(jobId);
            const runner = new Runner(job);
            this._handlers[jobId] = runner;
            this._jobs_processing.add(jobId);
            await runner.start();
            logger.info("BUILD_MAN: JOB_RESULT::", runner?.getStatus());
            if (runner.getStatus() > 1) {
              await this._stopJob(jobId);
            }
          } catch (error) {
            logger.error("BUILD_MAN: ERRORED-", error);
            await connection.lrem(REDIS_KEY.JOB_WAITING_QUEUE, 1, jobId);
            await connection.lrem(REDIS_KEY.JOB_PROCESSING_QUEUE, 1, jobId);
            delete this._handlers[jobId];
          }
        }
      }
    } catch (error) {
      logger.error("Failed to Process Job", error);
    }
  }
}

module.exports = new BuildManager();
