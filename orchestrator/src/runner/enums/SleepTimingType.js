/**
 * Represents step sleep timing type.
 *
 * @enum {number}
 */
const SleepTimingType = Object.freeze({
  None: 0,
  Inherit: 1,
  Before: 2,
  After: 3,
  BeforeAndAfter: 4,
  get: function (name) {
    return this[name];
  }
});

module.exports = SleepTimingType;
