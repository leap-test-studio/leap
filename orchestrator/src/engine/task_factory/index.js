const { E_EVENT_TYPE } = require("engine_utils");

const TestCaseTask = require("./case_task");
const TestScenarioTask = require("./suite_task");
const StartTask = require("./start_task");
const StopTask = require("./stop_task");
const TimerTask = require("./timer_task");

const TaskFactory = {
    createNew: (info) => {
        switch (info.type) {
            case E_EVENT_TYPE.START_EVENT:
                return new StartTask(info);
            case E_EVENT_TYPE.TEST_CASE_EVENT:
                return new TestCaseTask(info);
            case E_EVENT_TYPE.TEST_SUITE_EVENT:
                return new TestScenarioTask(info);
            case E_EVENT_TYPE.TIMER_EVENT:
                return new TimerTask(info);
            default:
                return new StopTask(info);
        }
    }
};

module.exports = TaskFactory;
