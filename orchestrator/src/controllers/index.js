const Router = require("express").Router();

Router.use("/accounts", require("./account.controller"));
Router.use("/project", require("./project.controller"));
Router.use("/runner", require("./runner.controller"));
Router.use("/dashboard", require("./dashboard.controller"));
module.exports = Router;
