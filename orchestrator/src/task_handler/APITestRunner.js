const isEqual = require("lodash/isEqual");
const isEmpty = require("lodash/isEmpty");

const Task = require("./Task");
const { TestStatus } = require("../constants");
const { httpRequest } = require("../utils");

class TestRunner extends Task {
  constructor(taskInfo) {
    super(taskInfo);
  }

  async execute() {
    this.steps = [];
    const stepOutcome = {
      stepNo: 1,
      result: TestStatus.RUNNING,
      startTime: Date.now()
    };

    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      stepOutcome.actual = await httpRequest({
        method: this.settings.method,
        baseUrl: this.settings.baseURL,
        uri: this.settings.url,
        timeout: this.settings.timeout,
        headers: this.settings.headers,
        json: !isEmpty(this.execSteps?.reqbody) ? JSON.parse(this.execSteps?.reqbody) : null
      });
      logger.info("API Response:", stepOutcome.actual);
      logger.info("Expected:", this.execSteps?.resBody);
      let result = this.execSteps?.statusCode === stepOutcome.actual.statusCode;
      if (result && !isEmpty(this.execSteps?.resBody)) {
        result = isEqual(JSON.parse(this.execSteps?.resBody), stepOutcome.actual.body);
      }
      logger.info("Actual:", stepOutcome.actual);
      stepOutcome.result = result ? TestStatus.PASS : TestStatus.FAIL;
    } catch (e) {
      logger.error("API Request Errored", e);
      stepOutcome.result = TestStatus.FAIL;
      stepOutcome.actual = e.message;
    }

    logger.info("Result:", stepOutcome.result);
    stepOutcome.endTime = Date.now();
    stepOutcome.stepTime = stepOutcome.endTime - stepOutcome.startTime;
    this.addStep(stepOutcome);
    this.actual = { actualResult: stepOutcome };
    this.result = stepOutcome.result;
    return Promise.resolve();
  }
}

module.exports = TestRunner;
