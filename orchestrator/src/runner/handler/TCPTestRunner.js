module.exports = function (testcase) {
  this.testcase = testcase;
  this.before = function () {
    return Promise.resolve(true);
  };
  this.execute = function () {
    return Promise.resolve(true);
  };
  this.after = function () {
    return Promise.resolve(true);
  };
  this.stop = function () {};
};
