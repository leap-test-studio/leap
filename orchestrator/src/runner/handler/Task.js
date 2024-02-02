const { EventEmitter } = require("events");
const isEmpty = require("lodash/isEmpty");

const { TestStatus } = require("../../constants");
const { getLocalTime } = require("../../utils/time");

class Task extends EventEmitter {
  constructor(o) {
    super();
    this._taskId = o.id;
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
    return !this._interruptTask || !this._skipSteps;
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
      if (isEmpty(this.execSteps) || this.type === TestStatus.DRAFT) {
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

  async afterHook() {
    const payload = {
      result: this.result,
      actual: this.actual,
      steps: this.steps,
      startTime: this._startTime,
      endTime: this._endTime
    };
    await this._updateJobDetails(this._taskId, payload);
  }

  toString(s) {
    return `BID:${this._buildId}, JID:${this._taskId}, TCID:${this._seqNo}, Message:${s}`;
  }

  async _notifyJob(result) {
    this.result = result;
    this._updateJobDetails(this._taskId, { result, extras: this._extras });
  }

  async _updateJobDetails(id, payload) {
    if (this._interruptTask) {
      return;
    }
    this.emit("UPDATE_STATUS", { id, payload });
  }

  before() {
    return Promise.resolve();
  }

  execute() {
    this.actual = { actualResult: "Invalid Test Case" };
    this.result = TestStatus.INVALID_TESTCASE;
    return Promise.resolve(true);
  }

  after() {
    return Promise.resolve();
  }

  stop() { }
}

module.exports = Task;
