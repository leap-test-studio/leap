const Task = require("./task");

class TimerTask extends Task {
  constructor(info) {
    super(info);
  }

  run() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._context.testcases = 0;
        resolve({ done: true, async: true });
      }, this._data.timer);
    });
  }
}

module.exports = TimerTask;
