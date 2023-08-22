const TestStatus = require("../enums/TestStatus");
const Job = require("./Job");

class TestRunner extends Job {
  constructor(job) {
    super(job);
  }
  async before() {
    return Promise.resolve(true);
  }
  async execute() {
    this.actual = { actualResult: "Invalid Test Case" };
    this.result = TestStatus.INVALID_TESTCASE;
    return Promise.resolve(true);
  }
  async after() {
    return Promise.resolve(true);
  }
  async stop() {}
}

module.exports = TestRunner;
