const TestCaseTask = require("./case_task");
const TestScenarioTask = require("./suite_task");
const StartTask = require("./start_task");
const StopTask = require("./stop_task");
const TimerTask = require("./timer_task");
const { JOB_TYPES } = require("../../constants");

const TaskFactory = {
  createNew: (info) => {
    switch (info.type) {
      case JOB_TYPES.START_TASK:
        return new StartTask(info);
      case JOB_TYPES.CASE_TASK:
        return new TestCaseTask(info);
      case JOB_TYPES.SCENARIO_TASK:
        return new TestScenarioTask(info);
      case JOB_TYPES.TIMER_TASK:
        return new TimerTask(info);
      default:
        return new StopTask(info);
    }
  }
};

module.exports = TaskFactory;
