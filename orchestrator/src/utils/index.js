const pagination = require("./pagination");
const time = require("./time");
const request = require("./request");

module.exports = {
  ...pagination,
  ...time,
  ...request
};
