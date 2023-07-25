/**
 * Supported test status types.
 *
 * @enum {number}
 */
const TestStatus = {
  DRAFT: 0,
  RUNNING: 1,
  PASS: 2,
  FAIL: 3,
  UNKNOWN: 4,
  SKIP: 5,
  ABORT: 6,
  INVALID_TESTCASE: 999
};

module.exports = TestStatus;
