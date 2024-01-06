const Task = require("../flowEngine/task");

class TestCaseTask extends Task {
  run({ node, context }) {
    console.log(Date.now(), new Date(), "TC", node?.id);
    return new Promise((resolve) => {
      setTimeout(() => {
        context.testcases += 1;
        resolve({ done: true, async: true });
      }, 100);
    });
  }
}

module.exports = TestCaseTask;
