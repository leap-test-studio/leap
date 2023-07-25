/**
 * Supported test strategies.
 *
 * @enum {number}
 */
const TestType = {
  Unknown: 0,
  API: 1,
  WEB: 2,
  GRPC: 3,
  TCP: 4,
  SSH: 5
};

module.exports = TestType;
