const express = require("express");
const { status } = require("http-status");
const isEmpty = require("lodash/isEmpty");
const { E_RUN_TYPE } = require("engine_utils");

const RunnerService = require("../services/runner_service");
const Authorizer = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");
const router = express.Router();

router.post("/:projectId/stop", csrf, Authorizer(), stopProjectBuilds);
router.post(
    "/:projectId/runProject",
    csrf,
    Authorizer.ci,
    Authorizer(),
    (req, res, next) => {
        req.params.flow = true;
        next();
    },
    startProjectBuilds
);
router.post("/:projectId/runTestSuite/:suiteId", csrf, Authorizer(), runTestSuite);
router.post("/:projectId/runTestCase", csrf, Authorizer(), runTestCase);

router.post("/:projectId/trigger", startProjectBuilds);

module.exports = router;

// Build Runner functions

function startProjectBuilds(req, res) {
    let options = {};
    if (!isEmpty(req.body)) {
        options = {
            ...req.body
        };
    }
    logger.info("Starting project build", req.params.projectId);
    RunnerService.create(req.auth?.id, req.params.projectId, {
        options
    })
        .then((response) => res.status(status.OK).json(response))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
        });
}

function stopProjectBuilds(req, res) {
    RunnerService.stop(req.params.projectId)
        .then((response) => res.status(status.ACCEPTED).json(response))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
        });
}

function runTestCase(req, res) {
    logger.info("Start Test Case", req.params.projectId, req.body);
    RunnerService.createTestCase(req.auth?.id, req.params.projectId, E_RUN_TYPE.TESTCASE, req.body)
        .then((response) => res.status(status.OK).json(response))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
        });
}

function runTestSuite(req, res) {
    logger.info("Start Test Suite", req.params.projectId, req.params.suiteId);
    RunnerService.createTestScenario(req.auth?.id, req.params.projectId, req.params.suiteId)
        .then((response) => res.status(status.OK).json(response))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
        });
}
