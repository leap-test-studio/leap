/**
 * Represents a condition for taking a screenshot.
 *
 * @enum {number}
 */
const ScreenshotConditionType = Object.freeze({
  Never: 0,
  Inherit: 1,
  Success: 2,
  Failure: 3,
  Always: 4,
  get: function (name) {
    return this[name];
  }
});

module.exports = ScreenshotConditionType;
