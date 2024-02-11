const capitalize = require("lodash/capitalize");

export const TestStatus = Object.freeze({
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

let props = {};
Object.keys(TestStatus).forEach((key) => {
  let value = TestStatus[key];
  if (!isNaN(value)) {
    props[value] = capitalize(key);
  }
});

export const StatusCodeLabel = Object.freeze({
  ...props
});

export const NodeTypes = Object.freeze({
  START_TASK: "START_TASK",
  TIMER_TASK: "TIMER_TASK",
  CASE_TASK: "CASE_TASK",
  SCENARIO_TASK: "SCENARIO_TASK",
  STOP_TASK: "STOP_TASK"
});

export const Operators = Object.freeze({
  eq: "Equals",
  ne: "Not Equals"
});
