const pagination = require("./pagination");
const time = require("./time");
const request = require("./request");
const account_name = require("./account_name");

module.exports = {
  ...account_name,
  ...pagination,
  ...time,
  ...request,
  BuildTypes: ["P", "TC", "TS"],
  TestCaseTypes: ["Definition", "REST API", "Web", "SSH"]
};
