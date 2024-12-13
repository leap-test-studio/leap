const Router = require("express").Router();

Router.use("/workflow", require("./workflow_controller"));
Router.use("/tenants", require("./tenant_controller"));
Router.use("/accounts", require("./account_controller"));
Router.use("/project", require("./project_controller"));
Router.use("/runner", require("./runner_controller"));
Router.use("/dashboard", require("./dashboard_controller"));
module.exports = Router;
