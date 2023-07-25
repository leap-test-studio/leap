/**
 * Represents a condition for taking a screenshot.
 *
 * @enum {number}
 */
const ScreenshotConditionType = {
  Never: 0,
  Inherit: 1,
  Success: 2,
  Failure: 3,
  Always: 4
};

module.exports = ScreenshotConditionType;
