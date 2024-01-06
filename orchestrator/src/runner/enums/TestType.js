/**
 * Supported test strategies.
 *
 * @enum {number}
 */
const TestType = Object.freeze({
  Scenario: 0,
  API: 1,
  WEB: 2,
  SSH: 3,
  get: function (name) {
    return this[name];
  }
});

module.exports = TestType;
