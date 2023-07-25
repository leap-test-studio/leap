const TestStatus = require("../enums/TestStatus");
const Job = require("./Job");
const BPromise = require("bluebird");

const SSH2Promise = require("ssh2-promise");

class TestRunner extends Job {
  constructor(job) {
    super(job);
    this.stepExecutor = this.stepExecutor.bind(this);
    this.conn = new SSH2Promise(this.settings);
  }

  async before() {
    logger.info("Initializing SSH connect");
    return await this.conn.connect();
  }

  async stepExecutor(accumulator, event) {
    const stepOutcome = {
      stepNo: accumulator.length + 1,
      result: TestStatus.RUNNING,
      startTime: Date.now(),
      event: event
    };

    if (!this.skipSteps && event.enabled) {
      try {
        logger.info("SSH Command", event.commandText);
        let result = await this.conn.exec(event.commandText);
        logger.info("SSH Output", result);
        if (result != null) {
          const arr = result.split("\n").filter((i) => !i.includes("Last login:"));
          result = arr.join("\n");
        }
        result = result.substring(0, result.length - 1);
        stepOutcome.result = event.expectedText?.length > 0 && event.expectedText != result ? TestStatus.FAIL : TestStatus.PASS;
        stepOutcome.actual = result;
      } catch (e) {
        logger.error("SSHTestRunner:", e);
        stepOutcome.result = TestStatus.FAIL;
        stepOutcome.actual = e.message;
      }
    } else {
      stepOutcome.actual = "Test case is disabled";
      stepOutcome.result = TestStatus.SKIP;
    }
    stepOutcome.endTime = Date.now();
    stepOutcome.stepTime = stepOutcome.endTime - stepOutcome.startTime;
    this.addStep(stepOutcome);
    return accumulator.concat(stepOutcome);
  }

  async execute() {
    logger.info("SSH steps", JSON.stringify(this.testcase?.execSteps));
    this.steps = await BPromise.reduce(this.testcase?.execSteps, this.stepExecutor, []);
    logger.info("SSH steps", JSON.stringify(this.steps));
    const outcome = this.steps.find((s) => s.result === TestStatus.FAIL) || { result: TestStatus.PASS };
    this.actual = { actualResult: outcome };
    this.result = outcome?.result;

    return Promise.resolve({
      actual: outcome?.actual,
      steps: this.steps,
      result: outcome?.result
    });
  }

  async after() {
    if (this.conn) {
      await this.conn.close();
    }
    this.conn = null;
    return Promise.resolve();
  }

  async stop() {
    await this.after();
  }
}

module.exports = TestRunner;
