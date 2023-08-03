const express = require("express");
const router = express.Router();
const authorize = require("../_middleware/authorize");
const dashboardService = require("../services/dashboard.service");
const status = require("http-status");

const csrf = require("../_middleware/checkCSRF");
const Role = require("../_helpers/role");

// Report routes
router.get("/build/recent", csrf, authorize([Role.Admin, Role.Manager]), getRecentBuildSummary);
router.get("/build/total", csrf, authorize([Role.Admin, Role.Manager]), getTotalStats);
router.get("/build/trend", csrf, authorize([Role.Admin, Role.Manager]), getBuildTrend);

router.get("/build/reports/:projectId", csrf, authorize([Role.Admin, Role.Manager]), getBuildReports);

router.get("/build/details/:buildNo", csrf, authorize([Role.Admin, Role.Manager]), getBuildDetails);

module.exports = router;

function getRecentBuildSummary(req, res) {
  dashboardService
    .getRecentBuildSummary(req.auth.id)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getTotalStats(req, res) {
  dashboardService
    .getTotalStats(req.auth.id)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getBuildReports(req, res) {
  dashboardService
    .getBuildReports(req.auth.id, req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getBuildDetails(req, res) {
  dashboardService
    .getBuildDetails(req.auth.id, req.params.buildNo)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getBuildTrend(req, res) {
  dashboardService
    .getBuildTrend(req.auth.id)
    .then((o) =>
      res.json({
        buildNo: o.map((o) => o.buildNo).reverse(),
        total: o.map((o) => o.total).reverse(),
        passed: o.map((o) => o.passed).reverse(),
        failed: o.map((o) => o.failed).reverse(),
        skipped: o.map((o) => o.skipped).reverse(),
        running: o.map((o) => o.running).reverse()
      })
    )
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}
