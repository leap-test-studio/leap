const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");
const authorize = require("../_middleware/authorize");
const projectService = require("../services/project.service");
const testSuiteService = require("../services/testscenario.service");
const testCaseService = require("../services/testcase.service");
const schedulerService = require("../services/scheduler.service");

const status = require("http-status");

const csrf = require("../_middleware/checkCSRF");
const AuthRoles = require("../_helpers/role");
const testcaseImporter = require("../_middleware/testcase-importer");

// Project routes
router.get("/", csrf, authorize(AuthRoles.All), getAllProjects);
router.post("/", authorize(AuthRoles.Leads), projectSchema, createProject);
router.get("/:projectId", csrf, authorize(AuthRoles.All), getProject);
router.get("/:projectId/builds", csrf, authorize(AuthRoles.All), getProjectBuilds);
router.get("/:projectId/export", csrf, authorize(AuthRoles.All), exportProject);
router.put("/:projectId", csrf, authorize(AuthRoles.Leads), projectUpdateSchema, updateProject);
router.delete("/:projectId", csrf, authorize(AuthRoles.Admins), _deleteProject);

// Test scenario routes
router.get("/:projectId/suite", csrf, authorize(AuthRoles.All), getTestSuites);
router.post("/:projectId/suite", csrf, authorize(AuthRoles.All), testSuiteSchema, createTestSuite);
router.post("/:projectId/suite/:suiteId/clone", csrf, authorize(AuthRoles.All), cloneTestSuite);
router.get("/:projectId/suite/:suiteId", csrf, authorize(AuthRoles.All), getTestSuite);
router.put("/:projectId/suite/:suiteId", csrf, authorize(AuthRoles.All), testSuiteSchema, updateTestSuite);
router.delete("/:projectId/suite/:suiteId", csrf, authorize(AuthRoles.Leads), deleteTestSuite);

// Test case routes
router.get("/:projectId/suite/:suiteId/testcases", csrf, authorize(AuthRoles.All), getAllTestCases);
router.post("/:projectId/suite/:suiteId/testcase", csrf, authorize(AuthRoles.All), testCaseSchema, createTestCase);
router.post("/:projectId/suite/:suiteId/testcase/:testcaseId/clone", csrf, authorize(AuthRoles.All), cloneTestCase);
router.post(
  "/:projectId/suite/:suiteId/testcase/:testcaseId/import",
  csrf,
  authorize(AuthRoles.All),
  testcaseImporter.single("upload-file"),
  importTestCase
);
router.get("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(AuthRoles.All), getTestCase);
router.put("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(AuthRoles.All), testCaseSchema, updateTestCase);
router.put("/:projectId/suite/:suiteId/testcase/:testcaseId/swap", csrf, authorize(AuthRoles.All), swapTestCase);
router.delete("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(AuthRoles.All), deleteTestCase);

// Job Scheduler routes
router.get("/:projectId/job", csrf, authorize(AuthRoles.All), getAllJobs);
router.post("/:projectId/job", csrf, authorize(AuthRoles.All), jobSchema, createJob);
router.get("/:projectId/job/:jobId", csrf, authorize(AuthRoles.All), getJobById);
router.put("/:projectId/job/:jobId", csrf, authorize(AuthRoles.All), jobSchema, updateJob);
router.delete("/:projectId/job/:jobId", csrf, authorize(AuthRoles.All), deleteJob);

module.exports = router;

// Project functions

function projectSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    description: Joi.string().optional(),
    settings: Joi.object().optional(),
    TestScenarios: Joi.array().optional()
  });
}

function projectUpdateSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4),
    description: Joi.string(),
    status: Joi.boolean(),
    settings: Joi.object()
  });
}

function getAllProjects(req, res) {
  projectService
    .list(req.tenantId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function getProjectBuilds(req, res) {
  projectService
    .getBuilds(req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createProject(req, res) {
  projectService
    .create(req.tenantId, req.auth.id, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Project '${req.body.name}' Created Successfully.`
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

function getProject(req, res) {
  projectService
    .getDetails(req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function exportProject(req, res) {
  projectService
    .export(req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateProject(req, res) {
  projectService
    .update(req.tenantId, req.auth.id, req.params.projectId, req.body)
    .then((data) => res.json({ message: `Project[${data.name}] Changes Saved Successfully.`, ...data }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function _deleteProject(req, res) {
  projectService
    .delete(req.tenantId, req.params.projectId)
    .then(() => res.json({ message: "Project Deleted Successfully." }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

// Test scenario functions

function testCloneScenarioSchema(req, _, next) {
  validateRequest(req, next, {
    suiteId: Joi.string().required(),
    name: Joi.string().min(4).required(),
    description: Joi.string()
  });
}

function testSuiteSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    description: Joi.string(),
    status: Joi.boolean(),
    remark: Joi.array().optional().default([]),
    settings: Joi.object()
  });
}

function getTestSuites(req, res) {
  testSuiteService
    .list(req.tenantId, req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createTestSuite(req, res) {
  testSuiteService
    .create(req.tenantId, req.auth.id, req.params.projectId, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Test Suite '${req.body.name}' Created Successfully.`
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

function getTestSuite(req, res) {
  testSuiteService
    .get(req.tenantId, req.params.projectId, req.params.suiteId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateTestSuite(req, res) {
  testSuiteService
    .update(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.body)
    .then((message) => res.json({ message }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function deleteTestSuite(req, res) {
  testSuiteService
    .delete(req.tenantId, req.params.projectId, req.params.suiteId)
    .then(() => res.json({ message: "Test Suite Deleted Successfully." }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function cloneTestSuite(req, res) {
  testSuiteService
    .clone(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Test Suite '${req.body.name}' Cloned Successfully.`
      })
    )
    .catch((err) => {
      console.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

// Test case functions

function testCaseSchema(req, _, next) {
  validateRequest(req, next, {
    title: Joi.string().optional(),
    enabled: Joi.boolean().optional(),
    given: Joi.string().allow(""),
    when: Joi.string().allow(""),
    then: Joi.string().allow(""),
    execSteps: Joi.any().optional(),
    settings: Joi.object().optional(),
    tags: Joi.array().optional(),
    type: Joi.number().optional()
  });
}

function getAllTestCases(req, res) {
  testCaseService
    .list(req.tenantId, req.params.suiteId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createTestCase(req, res) {
  testCaseService
    .create(req.tenantId, req.auth.id, req.params.suiteId, req.body)
    .then((o) =>
      res.json({
        details: `TID: ${o?.label}`,
        message: `Test Case Created Successfully.`
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

function cloneTestCase(req, res) {
  testCaseService
    .clone(req.tenantId, req.auth.id, req.params.suiteId, req.params.testcaseId)
    .then((o) =>
      res.json({
        id: o?.id,
        message: "Test Case Cloned successfully",
        details: `TID: ${o.label}`
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

function importTestCase(req, res) {
  if (!req.file) {
    return res.status(status.BAD_REQUEST).send({ message: "Please upload testcase file!" });
  }

  testCaseService
    .import(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.file.path)
    .then((o) =>
      res.json({
        id: o?.id,
        message: "Test Case Imported Successfully",
        details: `TID: ${o.label}`
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

function getTestCase(req, res) {
  testCaseService
    .get(req.tenantId, req.params.suiteId, req.params.testcaseId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function swapTestCase(req, res) {
  testCaseService
    .swap(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.body.target)
    .then((o) => res.json({ message: "Test Case Modified Successfully", details: `TID: ${o.label}` }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateTestCase(req, res) {
  testCaseService
    .update(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.body)
    .then((o) => res.json({ message: "Test Case Modified Successfully", details: `TID: ${o.label}` }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function deleteTestCase(req, res) {
  testCaseService
    .delete(req.tenantId, req.auth.id, req.params.suiteId, req.params.testcaseId)
    .then((o) => res.json({ message: "Test Case Deleted Successfully", details: `TID: ${o.label}` }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

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
    .getJobById(req.params.jobId)
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
    .createJob(req.auth.id, req.params.projectId, req.body)
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
    .updateJob(req.auth.id, req.params.projectId, req.params.jobId, req.body)
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
    .deleteJob(req.auth.id, req.params.projectId, req.params.jobId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}
