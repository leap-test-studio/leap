const TestStatus = require("../enums/TestStatus");
const Job = require("./Job");
const isEqual = require("lodash/isEqual");
const isEmpty = require("lodash/isEmpty");
const { httpRequest } = require("./common");

class TestRunner extends Job {
  constructor(job) {
    super(job);
  }

  async before() {
    return Promise.resolve();
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
        json: !isEmpty(this.testcase?.execSteps?.reqbody) ? JSON.parse(this.testcase?.execSteps?.reqbody) : null
      });
      logger.info("API Response:", stepOutcome.actual);
      logger.info("Expected:", this.testcase?.execSteps?.resBody);
      let result = this.testcase?.execSteps?.statusCode === stepOutcome.actual.statusCode;
      if (result && !isEmpty(this.testcase?.execSteps?.resBody)) {
        result = isEqual(JSON.parse(this.testcase?.execSteps?.resBody), stepOutcome.actual.body);
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

  async after() {
    return Promise.resolve();
  }

  async stop() {}
}

module.exports = TestRunner;
