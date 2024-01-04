const isEmpty = require("lodash/isEmpty");
const TestStatus = require("../enums/TestStatus");
const jobService = require("../../services/job/job.service");
const { getLocalTime } = require("../../utils/time");

class Job {
  constructor(o) {
    this.jobId = o.id;
    this.buildId = o.BuildMasterId;
    this.testCaseId = o.TestCaseId;
    this.settings = o.settings;
    this.actual = o.actual || {};
    this.result = o.result;
    this.steps = [];
    this.execSteps = o.execSteps;
    this.type = o.type;
    this.seqNo = o.seqNo;
    this.startTime = getLocalTime();
    this.endTime = null;
    this.skipSteps = false;
    this.stopRunning = false;
    this.extras = {};
  }

  addStep(step) {
    logger.trace("Adding step:", JSON.stringify(step));
    if (step.result === TestStatus.FAIL) {
      this.skipSteps = true;
    }
    if (step.result !== TestStatus.SKIP) {
      this.steps.push(step);
    }
    this.result = step.result;
    this.endTime = getLocalTime();
  }

  beforeHook() {
    return new Promise((resolve, reject) => {
      if (isEmpty(this.execSteps) || this.type == 0) {
        this.notifyJob(TestStatus.INVALID_TESTCASE);
        return reject({
          actual: this.execSteps,
          steps: [],
          result: TestStatus.INVALID_TESTCASE
        });
      } else {
        resolve();
      }
      this.notifyJob(TestStatus.RUNNING);
    });
  }

  async notifyJob(result) {
    this.result = result;
    this.updateJobDetails(this.jobId, { result, extras: this.extras });
  }

  async saveScreenshot(result) {
    if (!this.stopRunning) {
      return await jobService.updateScreenshot(this.jobId, result);
    }
  }

  async afterHook() {
    const payload = {
      result: this.result,
      actual: this.actual,
      steps: this.steps,
      startTime: this.startTime,
      endTime: this.endTime
    };
    await this.updateJobDetails(this.jobId, payload);
  }

  async updateJobDetails(id, payload) {
    if (this.stopRunning) {
      return;
    }
    try {
      logger.info(this.toString("Uploading Job details: " + JSON.stringify(payload)));
      const job = await jobService.updateJob(id, payload);
      await jobService.consolidate(job.BuildMasterId);
    } catch (error) {
      logger.error("Failed to Update", error);
    }
  }

  toString(s) {
    return `BID:${this.buildId}, JID:${this.jobId}, TCID:${this.seqNo}, Message:${s}`;
  }
}

module.exports = Job;
