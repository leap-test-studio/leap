const events = require("events");
const BPromise = require("bluebird");
const isEmpty = require("lodash/isEmpty");
const Whiteboard = require("whiteboard-pubsub");
const { E_EXEC_STATE, E_REDIS_KEY, E_RUN_TYPE } = require("engine_utils");
const { Op } = require("sequelize");

const RedisMan = Whiteboard.RedisMan;

const { getJobInfo, updateJob, consolidate, updateScreenshot } = require("../services/job_service");
const TestHandler = require("../test_handler");

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
        const jobs = await global.DbStoreModel.Job.findAll({
            include: [
                {
                    model: global.DbStoreModel.BuildMaster,
                    where: {
                        type: {
                            [Op.not]: E_RUN_TYPE.WORKFLOW
                        }
                    }
                }
            ],
            attributes: ["id"],
            where: { result: E_EXEC_STATE.DRAFT }
        });
        if (Array.isArray(jobs)) {
            const connection = await RedisMan.getConnection();
            await connection.del(E_REDIS_KEY.JOB_PROCESSED_QUEUE);
            await connection.del(E_REDIS_KEY.JOB_PROCESSING_QUEUE);
            const queueSize = await connection.llen(E_REDIS_KEY.JOB_WAITING_QUEUE);
            const waitingList = [...new Set(await connection.lrange(E_REDIS_KEY.JOB_WAITING_QUEUE, 0, queueSize))];
            logger.trace("Loading jobs from WaitingList", JSON.stringify(waitingList));
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
                const len = await connection.rpush(E_REDIS_KEY.JOB_WAITING_QUEUE, ...new Set(o));
                logger.info("Total Jobs enqueued to Waiting List:", len);
            }
        } catch (error) {
            logger.error("Failed to Enqueue ", o, error);
        }
    }

    async _stopJobs(jobs) {
        logger.trace(`BUILD_MAN: Stopping Jobs:${jobs}`);
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
            logger.trace(`BUILD_MAN: JID:${jobId} STOPPING_JOB`);
            const connection = await RedisMan.getConnection();
            await connection.rpush(E_REDIS_KEY.JOB_PROCESSED_QUEUE, jobId);
            await connection.lrem(E_REDIS_KEY.JOB_PROCESSING_QUEUE, 1, jobId);
            await connection.lrem(E_REDIS_KEY.JOB_WAITING_QUEUE, 1, jobId);
            if (this._handlers[jobId] != null) {
                try {
                    await this._handlers[jobId].stop();
                } catch (error) {
                    loggger.error("Failed to stop", error);
                }
                delete this._handlers[jobId];
            }
            this._jobs_processing.delete(jobId);
            logger.trace(`BUILD_MAN: JID:${jobId} STOPPED_JOB`);
        } catch (error) {
            logger.error("Failed to delete", jobId, error);
        }
    }

    async _run() {
        try {
            const connection = await RedisMan.getConnection();
            const queueSize = await connection.llen(E_REDIS_KEY.JOB_WAITING_QUEUE);
            //logger.trace(`BUILD_MAN: QueueSize[${queueSize}]`);
            if (queueSize > 0) {
                const jobId = (await connection.lrange(E_REDIS_KEY.JOB_WAITING_QUEUE, 0, 0))[0];
                //logger.trace(`BUILD_MAN: HEAD[${jobId}] ${Array.from(this._jobs_processing.keys()).join(", ")} ${this._jobs_processing.has(jobId)}`);
                if (jobId != null && !this._jobs_processing.has(jobId)) {
                    try {
                        logger.trace(`BUILD_MAN: JID:${jobId} START_JOB`);
                        await connection.rpush(E_REDIS_KEY.JOB_PROCESSING_QUEUE, jobId);
                        const jobInfo = await getJobInfo(jobId);
                        if (!jobInfo) {
                            await this._stopJob(jobId);
                        }
                        const runner = TestHandler.createRunner(jobInfo);
                        runner.on("UPDATE_STATUS", async ({ id, payload }) => {
                            try {
                                logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
                                const job = await updateJob(id, payload);
                                await consolidate(job.BuildMasterId);
                            } catch (error) {
                                logger.error("Failed to Update", error);
                            }
                        });

                        runner.on("CAPTURE_SCREENSHOT", async ({ id, ...result }) => {
                            await updateScreenshot(id, result);
                        });

                        this._handlers[jobId] = runner;
                        this._jobs_processing.add(jobId);
                        await runner.start();
                        logger.trace(`BUILD_MAN: JID:${jobId} JOB_RESULT: ${runner.getStatus()}`);
                        if (runner.getStatus() > 1) {
                            await this._stopJob(jobId);
                        }
                    } catch (error) {
                        logger.error(`BUILD_MAN: JID:${jobId} ERRORED-`, error);
                        await connection.lrem(E_REDIS_KEY.JOB_WAITING_QUEUE, 1, jobId);
                        await connection.lrem(E_REDIS_KEY.JOB_PROCESSING_QUEUE, 1, jobId);
                        delete this._handlers[jobId];
                    }
                }
            }
        } catch (error) {
            logger.error("Failed to Process Job", error);
        }
    }
}

exports.BuildManager = new BuildManager();
