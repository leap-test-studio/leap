const TestCaseHandler = require("./handler");

module.exports = {
  executeJob
};

async function executeJob(job) {
  try {
    await new TestCaseHandler(job).run();
  } catch (e) {
    logger.error("Job Execution Failed", e);
  }
}
