const { EventEmitter } = require("events");
const uuid = require("uuid");

const { default: Queue } = require("../utils/queue");
const { SessionStates, JobStatus } = require("./status");
const { JOB_TYPES, JOB_STATUS } = require("../constants");
const TaskHandler = require("../task_handler");

const { getSettingsByTestId } = require("../services/job_service");

class EngineState extends EventEmitter {
  _projectId;
  _sessionId;
  _state;
  _execQueue;
  _processing;
  _processed;
  _nodes;
  constructor({ projectId, sessionId, nodes, edges }) {
    super();
    this._projectId = projectId;
    this._sessionId = sessionId || uuid.v4();
    this._state = SessionStates.READY;

    this._execQueue = new Queue();
    this._createdAt = Date.now();
    this._processing = new Map();
    this._processed = new Map();
    this._nodes = new Map();
  }

  registerEvents() {
    _this = this;
    this.on("run", this.run);
    this.on("nodeProcessed", (nodeID) => {
      _this._processed[nodeID] = {};
    });
    this.on("execute-job", (job) => {
      _this._executeJob(job);
    });
    this.on("job-status", (job) => {
      _this._executeJob(job);
    });
  }

  run() {
    if (this._state === SessionStates.READY) {
      this._execQueue.push("start");
      this.changeState(SessionStates.RUNNING);
      this.emit("run");
    }
    if (this._state === SessionStates.RUNNING) {
      for (let index = 0; index < this._execQueue.length; index++) {
        const job = this._execQueue.pop();
        this.changeJobState(job, JobStatus.READY);
        if (!this._processing.has(job)) {
          this._processing.set(job, {});
          this._executeJob(job);
        }
      }
      setTimeout(() => this.emit("run"), 5000);
    }
  }

  changeState(state) {
    if (SessionStates[state]) this._state = state;
  }

  changeJobState(job, state, progress) {
    // if (JobStatus[state]) this._state = state;
  }

  getJobState(job) {
    // if (JobStatus[state]) this._state = state;
  }

  _canJobRun(job) {
    if (!job) return false;
  }

  async _executeJob(job) {
    try {
      if (!this._canJobRun(job)) {
        return;
      }
      this.changeJobState(job, JOB_STATUS.ACTIVE);
      const jobDetails = this._nodes.get(job);
      this._processing.set(job, jobDetails);
      switch (jobDetails.type) {
        case JOB_TYPES.START_TASK:
          this.changeJobState(job, JOB_STATUS.COMPLETED, 100);
          break;
        case JOB_TYPES.SCENARIO_TASK:
          break;
        case JOB_TYPES.CASE_TASK:
          const taskInfo = await getSettingsByTestId(jobDetails.data.id);

          const runner = TaskHandler.createHandler(taskInfo);
          runner.on("UPDATE_STATUS", async ({ id, payload }) => {
            try {
              logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
            } catch (error) {
              logger.error("Failed to Update", error);
            }
          });

          runner.on("CAPTURE_SCREENSHOT", async ({ taskId, ...result }) => {});
          break;
        case JOB_TYPES.TIMER_TASK:
          const timer = jobDetails.data?.timer || 5000;
          let elapsed = 0;
          const tick = () => {
            const progress = Math.round((elapsed / timer) * 100);
            if (progress >= 100) {
              this.changeJobState(job, JOB_STATUS.COMPLETED, 100);
              return;
            }
            if (this.getJobState(job) !== JOB_STATUS.COMPLETED || this.getJobState(job) !== JOB_STATUS.ABORTED) {
              elapsed += 500;
              this.changeJobState(job, JOB_STATUS.ACTIVE, progress);
              setTimeout(tick, 500);
            }
          };
          tick();
          break;
      }
      this._execQueue.push("");
    } catch (err) {
    } finally {
    }
  }
}
