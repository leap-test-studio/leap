const Task = require("./task");

class StartTask extends Task {
  run() {
    super.run()
    return new Promise((resolve) => {
      setTimeout(() => {
        this._context.testcases = 0;
        resolve({ done: true, async: true });
      }, 1000);
    });
  }
}

module.exports = StartTask;
