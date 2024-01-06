const isEmpty = require("lodash/isEmpty");
const TestStatus = require("../enums/TestStatus");
const JobService = require("../job.service");
const { getLocalTime } = require("../../utils/time");

class Job {
  constructor(o) {
    this._jobId = o.id;
    this._buildId = o.BuildMasterId;
    this.settings = o.settings;
    this.actual = o.actual || {};
    this.result = o.result;
    this.steps = [];
    this.execSteps = o.execSteps;
    this.type = o.type;
    this._seqNo = o.seqNo;
    this._startTime = getLocalTime();
    this._endTime = null;
    this._skipSteps = false;
    this._interruptTask = false;
    this._extras = {};
  }

  interruptTask() {
    this._skipSteps = true;
    this._interruptTask = true;
  }

  shouldTaskContinue() {
    return !this._interruptTask || !this._skipStep;
  }

  addStep(step) {
    logger.trace("Adding step:", JSON.stringify(step));
    if (step.result === TestStatus.FAIL) {
      this._skipSteps = true;
    }
    if (step.result !== TestStatus.SKIP) {
      this.steps.push(step);
    }
    this.result = step.result;
    this._endTime = getLocalTime();
  }

  beforeHook() {
    return new Promise((resolve, reject) => {
      if (isEmpty(this.execSteps) || this.type == 0) {
        this._notifyJob(TestStatus.INVALID_TESTCASE);
        return reject({
          actual: this.execSteps,
          steps: [],
          result: TestStatus.INVALID_TESTCASE
        });
      } else {
        resolve();
      }
      this._notifyJob(TestStatus.RUNNING);
    });
  }

  setBuildProperties(key, value) {
    this._extras[key] = value;
  }

  getBuildProperties(key) {
    return this._extras[key];
  }

  async saveScreenshot(result) {
    if (!this._interruptTask) {
      return await JobService.updateScreenshot(this._jobId, result);
    }
  }

  async afterHook() {
    const payload = {
      result: this.result,
      actual: this.actual,
      steps: this.steps,
      startTime: this._startTime,
      endTime: this._endTime
    };
    await this._updateJobDetails(this._jobId, payload);
  }

  toString(s) {
    return `BID:${this._buildId}, JID:${this._jobId}, TCID:${this._seqNo}, Message:${s}`;
  }

  async _notifyJob(result) {
    this.result = result;
    this._updateJobDetails(this._jobId, { result, extras: this._extras });
  }

  async _updateJobDetails(id, payload) {
    if (this._interruptTask) {
      return;
    }
    try {
      logger.info(this.toString("Uploading Job details: " + JSON.stringify(payload)));
      const job = await JobService.updateJob(id, payload);
      await JobService.consolidate(job.BuildMasterId);
    } catch (error) {
      logger.error("Failed to Update", error);
    }
  }
}

module.exports = Job;
