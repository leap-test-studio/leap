const express = require("express");
const router = express.Router();
const runner = require("../services/runner.service");
const status = require("http-status");
const isEmpty = require("lodash/isEmpty");
const authorize = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");

router.post("/:projectId/stop", csrf, authorize(), stopProjectBuilds);
router.post("/:projectId/runProject", csrf, authorize(), startProjectBuilds);
router.post("/:projectId/runTestScenario/:suiteId", csrf, authorize(), startTestScenario);
router.post("/:projectId/runTestCases", csrf, authorize(), startTestCases);

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
  runner
    .create(req.auth?.id, req.params.projectId, {
      options
    })
    .then((response) => res.status(status.ACCEPTED).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}

function stopProjectBuilds(req, res) {
  runner
    .stop(req.params.projectId)
    .then((response) => res.status(status.ACCEPTED).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}

function startTestCases(req, res) {
  logger.info("StartTestCases", req.params.projectId, req.body);
  runner
    .createTestCase(req.auth?.id, req.params.projectId, req.body)
    .then((response) => res.status(status.OK).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}

function startTestScenario(req, res) {
  logger.info("Start Test Scenario", req.params.projectId, req.params.suiteId);
  runner
    .createTestScenario(req.auth?.id, req.params.projectId, req.params.suiteId)
    .then((response) => res.status(status.OK).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}
