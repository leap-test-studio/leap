const express = require("express");
const router = express.Router();
const authorize = require("../_middleware/authorize");
const DashboardService = require("../services/dashboard_service");
const { status } = require("http-status");
const { RoleGroups } = require("engine_utils");

// Report routes
router.get("/build/recent", authorize(RoleGroups.All), getRecentBuildSummary);
router.get("/build/total", authorize(RoleGroups.All), getTotalStats);
router.get("/build/trend/:projectId", authorize(RoleGroups.All), getBuildTrend);

router.get("/build/reports/:projectId", authorize(RoleGroups.All), getBuildReports);

router.get("/build/details/:projectId/bno/:buildNo", authorize(RoleGroups.All), getBuildDetails);

module.exports = router;

function getRecentBuildSummary(req, res) {
    DashboardService.getRecentBuildSummary(req.auth.id)
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
    DashboardService.getTotalStats(req.auth.id)
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
    DashboardService.getBuildReports(req.auth.id, req.params.projectId)
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
    DashboardService.getBuildDetails(req.params.projectId, req.params.buildNo)
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
    DashboardService.getBuildTrend(req.params.projectId)
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
