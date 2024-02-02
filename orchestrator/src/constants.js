exports.REDIS_KEY = Object.freeze({
  JOB_WAITING_QUEUE: "JOB-WAITING-QUEUE",
  JOB_PROCESSING_QUEUE: "JOB-PROCESSING-QUEUE",
  JOB_PROCESSED_QUEUE: "JOB-PROCESSED-QUEUE"
});

exports.RUN_TYPE = Object.freeze({
  TESTCASE: 1,
  TESTSCENARIO: 2
});

exports.STATUSCODES = Object.freeze({
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR"
});

exports.TASK_TYPES = Object.freeze({
  START_TASK: "START_TASK",
  TIMER_TASK: "TIMER_TASK",
  CASE_TASK: "CASE_TASK",
  SCENARIO_TASK: "SCENARIO_TASK",
  STOP_TASK: "STOP_TASK"
});

/**
 * Represents a condition for taking a screenshot.
 *
 * @enum {number}
 */
exports.ScreenshotConditionType = Object.freeze({
  Never: 0,
  Inherit: 1,
  Success: 2,
  Failure: 3,
  Always: 4,
  get: function (name) {
    return this[name];
  }
});

/**
 * Represents step sleep timing type.
 *
 * @enum {number}
 */
exports.SleepTimingType = Object.freeze({
  None: 0,
  Inherit: 1,
  Before: 2,
  After: 3,
  BeforeAndAfter: 4,
  get: function (name) {
    return this[name];
  }
});

/**
 * Supported test status types.
 *
 * @enum {number}
 */
exports.TestStatus = Object.freeze({
  DRAFT: 0,
  RUNNING: 1,
  PASS: 2,
  FAIL: 3,
  UNKNOWN: 4,
  SKIP: 5,
  ABORT: 6,
  INVALID_TESTCASE: 999,
  get: function (name) {
    return this[name];
  }
});

/**
 * Supported test strategies.
 *
 * @enum {number}
 */
exports.TestType = Object.freeze({
  Scenario: 0,
  API: 1,
  WEB: 2,
  SSH: 3,
  get: function (name) {
    return this[name];
  }
});
