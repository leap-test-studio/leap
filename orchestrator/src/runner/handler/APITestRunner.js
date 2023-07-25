const axios = require("axios");
const TestStatus = require("../enums/TestStatus");
const Job = require("./Job");
const isEqual = require("lodash/isEqual");
const { isEmpty } = require("lodash");
const http = require("http");
const https = require("https");

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
      const config = {
        withCredentials: false,
        httpAgent: new http.Agent({ keepAlive: true, rejectUnauthorized: false }),
        httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
        method: this.settings.method,
        url: this.settings.url,
        baseURL: this.settings.baseURL,
        timeout: this.settings.timeout
      };
      if (!isEmpty(this.settings.headers)) {
        config.headers = this.settings.headers;
      }
      if (!isEmpty(this.testcase?.execSteps?.reqbody)) {
        config.data = JSON.parse(this.testcase?.execSteps?.reqbody);
      }
      logger.info("API Request:", JSON.stringify(config, null, 2));
      const res = await axios(config);
      stepOutcome.actual = {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      };
      logger.info("Expected:", this.testcase?.execSteps?.resBody);
      let result = this.testcase?.execSteps?.statusCode === res.status;
      if (result && !isEmpty(this.testcase?.execSteps?.resBody)) {
        result = isEqual(JSON.parse(this.testcase?.execSteps?.resBody), res.data);
        stepOutcome.actual.data = res.data;
      }
      logger.info("Actual:", stepOutcome.actual);

      stepOutcome.result = result ? TestStatus.PASS : TestStatus.FAIL;
      logger.info("Result:", stepOutcome.result);
    } catch (e) {
      stepOutcome.result = TestStatus.FAIL;
      stepOutcome.actual = e.message;
    }

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
