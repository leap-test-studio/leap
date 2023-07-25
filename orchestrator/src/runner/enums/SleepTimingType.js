/**
 * Represents step sleep timing type.
 *
 * @enum {number}
 */
const SleepTimingType = {
  None: 0,
  Inherit: 1,
  Before: 2,
  After: 3,
  BeforeAndAfter: 4
};

module.exports = SleepTimingType;
