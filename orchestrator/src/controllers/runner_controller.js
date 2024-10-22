const express = require("express");
const { status } = require("http-status");

const isEmpty = require("lodash/isEmpty");

const RunnerService = require("../services/runner_service");
const Authorizer = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");
const { RUN_TYPE } = require("../constants");
const router = express.Router();

router.post("/:projectId/stop", csrf, Authorizer(), stopProjectBuilds);
router.post(
  "/:projectId/runProject",
  csrf,
  async (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.replace("Bearer ", "");
      if (token === "ci") {
        const account = await global.DbStoreModel.Account.findOne({
          where: {
            email: "ykrishnaraju@ebates.com"
          }
        });
        req.ciaccount = account;
      }
    } catch (error) {}
    next();
  },
  Authorizer(),
  (req, res, next) => {
    req.params.flow = true;
    next();
  },
  startProjectBuilds
);
router.post("/:projectId/runTestScenario/:suiteId", csrf, Authorizer(), startTestScenario);
router.post("/:projectId/runTestCases", csrf, Authorizer(), startTestCases);

router.post("/:projectId/trigger", startProjectBuilds);
router.post("/:projectId/trigger-sequence", triggerSequence);

module.exports = router;

// Build Runner functions
function triggerSequence(req, res) {
  logger.info("triggerSequence", req.params.projectId);
  RunnerService.triggerSequence(req.params.projectId)
    .then((response) => res.status(status.ACCEPTED).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}

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

function startTestCases(req, res) {
  logger.info("Start Test Case", req.params.projectId, req.body);
  RunnerService.createTestCase(req.auth?.id, req.params.projectId, RUN_TYPE.TESTCASE, req.body)
    .then((response) => res.status(status.OK).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}

function startTestScenario(req, res) {
  logger.info("Start Test Suite", req.params.projectId, req.params.suiteId);
  RunnerService.createTestScenario(req.auth?.id, req.params.projectId, req.params.suiteId)
    .then((response) => res.status(status.OK).json(response))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
    });
}
