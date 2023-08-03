const express = require("express");
const router = express.Router();
const schedulerService = require("../service/scheduler.service");
const status = require("http-status");
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");

// Job Scheduler routes
router.get("/project/:projectId", getAllJobs);
router.get("/project/:projectId/job/:jobId", getJobById);
router.post("/project/:projectId", jobSchema, createJob);
router.put("/project/:projectId/job/:jobId", jobSchema, updateJob);
router.delete("/project/:projectId/job/:jobId", deleteJob);

module.exports = router;

// Job Scheduler functions

function jobSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    cron_setting: Joi.string()
      .required()
      .regex(
        /(^((\*\/)?([1-5]?[0-9])((\,|\-|\/)\d+)*|\*)\s((\*\/)?((2[0-3]|1[0-9]|[0-9]))((\,|\-|\/)\d+)*|\*)\s((\*\/)?([1-9]|[12][0-9]|3[01])((\,|\-|\/)\d+)*|\*)\s((\*\/)?([1-9]|1[0-2])((\,|\-|\/)\d+)*|\*)\s((\*\/)?[0-6]((\,|\-|\/)\d+)*|\*)$)|@(annually|yearly|monthly|weekly|daily|hourly|reboot)/
      ),
    callback: Joi.object(),
    status: Joi.number().optional()
  });
}

function getAllJobs(req, res) {
  schedulerService
    .getAllJobs(req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getJobById(req, res) {
  schedulerService
    .getJobById(req.params.projectId, req.params.jobId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createJob(req, res) {
  schedulerService
    .createJob(req.params.projectId, req.body)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateJob(req, res) {
  schedulerService
    .updateJob(req.params.projectId, req.params.jobId, req.body)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function deleteJob(req, res) {
  schedulerService
    .deleteJob(req.params.projectId, req.params.jobId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}
