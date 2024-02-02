const { TASK_TYPES } = require("../constants");
const StartTask = require("./start_task");

class TaskFactory {
  constructor(info) {
    switch (info.type) {
      case TASK_TYPES.START_NODE:
        this._task = new StartTask(info);
        break;
      case TASK_TYPES.TESTCASE_NODE:

        break;
      case TASK_TYPES.TESTSCENARIO_NODE:

        break;
      case TASK_TYPES.TIMER_NODE:

        break;

      default:

    }


  }

  run() {
    this._task.run();
  }
}

module.exports = TaskFactory;

