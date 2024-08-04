const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");
const authorize = require("../_middleware/authorize");
const projectService = require("../services/project.service");
const testScenarioService = require("../services/testscenario.service");
const testCaseService = require("../services/testcase.service");
const schedulerService = require("../services/scheduler.service");

const status = require("http-status");

const csrf = require("../_middleware/checkCSRF");
const Role = require("../_helpers/role");
const testcaseImporter = require("../_middleware/testcase-importer");

// Project routes
router.get("/", csrf, authorize([Role.Admin, Role.Manager]), getAllProjects);
router.post("/", csrf, authorize([Role.Admin, Role.Manager]), projectSchema, createProject);
router.get("/:projectId", csrf, authorize([Role.Admin, Role.Manager]), getProject);
router.get("/:projectId/builds", csrf, authorize([Role.Admin, Role.Manager]), getProjectBuilds);
router.get("/:projectId/export", csrf, authorize([Role.Admin, Role.Manager]), exportProject);
router.put("/:projectId", csrf, authorize([Role.Admin, Role.Manager]), projectUpdateSchema, updateProject);
router.delete("/:projectId", csrf, authorize([Role.Admin, Role.Manager]), _deleteProject);

// Test scenario routes
router.get("/:projectId/scenario", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), getAllTestScenarios);
router.post("/:projectId/scenario", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), testScenarioSchema, createTestScenario);
router.post("/:projectId/scenario/:scenarioId/clone", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), cloneTestScenario);
router.get("/:projectId/scenario/:scenarioId", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), getTestScenario);
router.put("/:projectId/scenario/:scenarioId", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), testScenarioSchema, updateTestScenario);
router.delete("/:projectId/scenario/:scenarioId", csrf, authorize([Role.Admin, Role.Manager, Role.Lead]), deleteTestScenario);

// Test case routes
router.get("/:projectId/scenario/:scenarioId/testcases", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), getAllTestCases);
router.post("/:projectId/scenario/:scenarioId/testcase", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), testCaseSchema, createTestCase);
router.post("/:projectId/scenario/:scenarioId/testcase/:testcaseId/clone", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), cloneTestCase);
router.post(
  "/:projectId/scenario/:scenarioId/testcase/:testcaseId/import",
  csrf,
  authorize([Role.Admin, Role.Lead, Role.Engineer]),
  testcaseImporter.single("upload-file"),
  importTestCase
);
router.get("/:projectId/scenario/:scenarioId/testcase/:testcaseId", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), getTestCase);
router.put(
  "/:projectId/scenario/:scenarioId/testcase/:testcaseId",
  csrf,
  authorize([Role.Admin, Role.Lead, Role.Engineer]),
  testCaseSchema,
  updateTestCase
);
router.delete("/:projectId/scenario/:scenarioId/testcase/:testcaseId", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), deleteTestCase);

// Job Scheduler routes
router.get("/:projectId/job", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), getAllJobs);
router.post("/:projectId/job", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), jobSchema, createJob);
router.get("/:projectId/job/:jobId", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), getJobById);
router.put("/:projectId/job/:jobId", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), jobSchema, updateJob);
router.delete("/:projectId/job/:jobId", csrf, authorize([Role.Admin, Role.Lead, Role.Engineer]), deleteJob);

module.exports = router;

// Project functions

function projectSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    description: Joi.string(),
    status: Joi.boolean(),
    settings: Joi.object()
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
    .list(req.auth.id)
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
    .create(req.auth.id, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Project '${req.body.name}' created successfully.`
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
    .update(req.auth.id, req.params.projectId, req.body)
    .then((data) => res.json({ message: `Project[${data.name}] changes saved successfully.`, ...data }))
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
    .delete(req.auth.id, req.params.projectId)
    .then(() => res.json({ message: "Project deleted successfully." }))
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
    scenarioId: Joi.string().required(),
    name: Joi.string().min(4).required(),
    description: Joi.string()
  });
}

function testScenarioSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    description: Joi.string(),
    status: Joi.boolean(),
    remark: Joi.string(),
    settings: Joi.object()
  });
}

function getAllTestScenarios(req, res) {
  testScenarioService
    .list(req.auth.id, req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createTestScenario(req, res) {
  testScenarioService
    .create(req.auth.id, req.params.projectId, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Test scenario '${req.body.name}' created successfully.`
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

function getTestScenario(req, res) {
  testScenarioService
    .get(req.auth.id, req.params.projectId, req.params.scenarioId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateTestScenario(req, res) {
  testScenarioService
    .update(req.auth.id, req.params.projectId, req.params.scenarioId, req.body)
    .then((message) => res.json({ message }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function deleteTestScenario(req, res) {
  testScenarioService
    .delete(req.auth.id, req.params.projectId, req.params.scenarioId)
    .then(() => res.json({ message: "Test scenario deleted successfully." }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function cloneTestScenario(req, res) {
  testScenarioService
    .clone(req.auth.id, req.params.projectId, req.params.scenarioId, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `Test scenario '${req.body.name}' cloned successfully.`
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
    enabled: Joi.boolean().optional(),
    given: Joi.string().optional(),
    when: Joi.string().optional(),
    then: Joi.string().optional(),
    execSteps: Joi.any().optional(),
    settings: Joi.object().optional().default({}),
    tags: Joi.array().optional().default([]),
    type: Joi.number().optional()
  });
}

function getAllTestCases(req, res) {
  testCaseService
    .list(req.auth.id, req.params.scenarioId)
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
    .create(req.auth.id, req.params.scenarioId, req.body)
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
    .clone(req.auth.id, req.params.scenarioId, req.params.testcaseId)
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
    .import(req.auth.id, req.params.scenarioId, req.params.testcaseId, req.file.path)
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
    .get(req.auth.id, req.params.scenarioId, req.params.testcaseId)
    .then((o) => res.json(o))
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
    .update(req.auth.id, req.params.projectId, req.params.scenarioId, req.params.testcaseId, req.body)
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
    .delete(req.auth.id, req.params.scenarioId, req.params.testcaseId)
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
