const isEqual = require("lodash/isEqual");
const isEmpty = require("lodash/isEmpty");
const vm = require("vm");

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
      const headers = {};
      this.settings.header?.forEach((header) => {
        headers[header.key] = header.value;
      });
      let outcome = await httpRequest({
        method: this.settings.method,
        baseUrl: this.settings.host,
        uri: this.settings.path,
        timeout: this.settings.timeout,
        headers,
        json: !isEmpty(this.execSteps?.reqBody) ? JSON.parse(this.execSteps?.reqBody) : null
      });
      stepOutcome.actual = outcome.print();
      logger.info("API Response:", stepOutcome.actual);
      logger.info("Expected StatusCode:", this.execSteps?.statusCode, ", Actual StatusCode:", outcome.statusCode);
      logger.info("Expected ResponsePayload:", this.execSteps?.resBody, ", Actual ResponsePayload:", outcome.body);
      logger.info("Expression:", this.execSteps?.condition);

      let result = this.execSteps?.statusCode === outcome.statusCode;
      if (result && !isEmpty(this.execSteps?.condition)) {
        try {
          const context = vm.createContext({ ...outcome, print: null });
          new vm.Script("finalExpr=" + this.execSteps?.condition).runInContext(context);
          result = context.finalExpr;
        } catch (e) {
          logger.error(e);
        }
      } else if (result && !isEmpty(this.execSteps?.resBody)) {
        result = isEqual(JSON.parse(this.execSteps?.resBody), outcome.response);
      }
      stepOutcome.result = result ? TestStatus.PASS : TestStatus.FAIL;
      logger.info("Test Result:", result ? "Pass" : "Fail");
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
