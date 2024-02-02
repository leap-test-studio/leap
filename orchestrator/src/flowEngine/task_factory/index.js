const { TASK_TYPES } = require("../../constants");
const TestCaseTask = require("./case_task");
const TestScenarioTask = require("./scenario_task");
const StartTask = require("./start_task");
const StopTask = require("./stop_task");
const TimerTask = require("./timer_task");

const TaskFactory = {
  createNewTask: (info) => {
    switch (info.type) {
      case TASK_TYPES.START_TASK:
        return new StartTask(info);
      case TASK_TYPES.CASE_TASK:
        return new TestCaseTask(info);
      case TASK_TYPES.SCENARIO_TASK:
        return new TestScenarioTask(info);
      case TASK_TYPES.TIMER_TASK:
        return new TimerTask(info);
      default:
        return new StopTask(info);
    }
  }
};

module.exports = TaskFactory;
