const express = require("express");
const Joi = require("joi");
const { status } = require("http-status");
const { RoleGroups } = require("engine_utils");

const validateRequest = require("../_middleware/validate-request");
const authorize = require("../_middleware/authorize");
const ProjectService = require("../services/project_service");
const TestSuiteService = require("../services/testscenario_service");
const TestCaseService = require("../services/testcase_service");
const SchedulerService = require("../services/scheduler_service");

const router = express.Router();
const csrf = require("../_middleware/checkCSRF");
const projectImporter = require("../_middleware/project-importer");
const testcaseImporter = require("../_middleware/testcase-importer");

// Project routes
router.get("/", csrf, authorize(RoleGroups.All), getAllProjects);
router.post("/", authorize(RoleGroups.Leads), projectSchema, createProject);
router.post("/importer/json", csrf, authorize(RoleGroups.Leads), projectImporter.single("upload-file"), importProject);
router.get("/:projectId", csrf, authorize(RoleGroups.All), getProject);
router.get("/:projectId/builds", csrf, authorize(RoleGroups.All), getProjectBuilds);
router.get("/:projectId/export", csrf, authorize(RoleGroups.All), exportProject);
router.put("/:projectId", csrf, authorize(RoleGroups.Leads), projectUpdateSchema, updateProject);
router.delete("/:projectId", csrf, authorize(RoleGroups.Admins), _deleteProject);

// Test scenario routes
router.get("/:projectId/suite", csrf, authorize(RoleGroups.All), getTestSuites);
router.post("/:projectId/suite", csrf, authorize(RoleGroups.Leads), testSuiteSchema, createTestSuite);
router.post("/:projectId/suite/:suiteId/clone", csrf, authorize(RoleGroups.Leads), cloneTestSuite);
router.get("/:projectId/suite/:suiteId", csrf, authorize(RoleGroups.All), getTestSuite);
router.put("/:projectId/suite/:suiteId", csrf, authorize(RoleGroups.Leads), testSuiteSchema, updateTestSuite);
router.delete("/:projectId/suite/:suiteId", csrf, authorize(RoleGroups.Leads), deleteTestSuite);

// Test case routes
router.get("/:projectId/suite/:suiteId/testcases", csrf, authorize(RoleGroups.All), getAllTestCases);
router.post("/:projectId/suite/:suiteId/testcase", csrf, authorize(RoleGroups.All), testCaseSchema, createTestCase);
router.post("/:projectId/suite/:suiteId/testcase/:testcaseId/clone", csrf, authorize(RoleGroups.All), cloneTestCase);
router.post(
    "/:projectId/suite/:suiteId/testcase/:testcaseId/import",
    csrf,
    authorize(RoleGroups.All),
    testcaseImporter.single("upload-file"),
    importTestCase
);
router.get("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(RoleGroups.All), getTestCase);
router.put("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(RoleGroups.All), testCaseSchema, updateTestCase);
router.put("/:projectId/suite/:suiteId/testcase/:testcaseId/swap", csrf, authorize(RoleGroups.All), swapTestCase);
router.delete("/:projectId/suite/:suiteId/testcase/:testcaseId", csrf, authorize(RoleGroups.All), deleteTestCase);

// Job Scheduler routes
router.get("/:projectId/job", csrf, authorize(RoleGroups.All), getAllJobs);
router.post("/:projectId/job", csrf, authorize(RoleGroups.All), jobSchema, createJob);
router.get("/:projectId/job/:jobId", csrf, authorize(RoleGroups.All), getJobById);
router.put("/:projectId/job/:jobId", csrf, authorize(RoleGroups.All), jobSchema, updateJob);
router.delete("/:projectId/job/:jobId", csrf, authorize(RoleGroups.All), deleteJob);

module.exports = router;

// Project functions

function projectSchema(req, _, next) {
    validateRequest(req, next, {
        name: Joi.string().min(4).required(),
        description: Joi.string().min(0).optional().default(""),
        settings: Joi.object().optional(),
        TestScenarios: Joi.array().optional()
    });
}

function projectUpdateSchema(req, _, next) {
    validateRequest(req, next, {
        name: Joi.string().min(4),
        description: Joi.string().min(0),
        status: Joi.boolean(),
        settings: Joi.object()
    });
}

function getAllProjects(req, res) {
    ProjectService.list(req.tenantId)
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
    ProjectService.getBuilds(req.params.projectId)
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
    ProjectService.create(req.tenantId, req.auth.id, req.body)
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
    ProjectService.getDetails(req.params.projectId)
        .then((o) => res.json(o))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

async function importProject(req, res) {
    if (!req.file) {
        return res.status(status.BAD_REQUEST).send({ message: "Please upload Project export file!" });
    }

    ProjectService.import(req.tenantId, req.auth.id, req.body, req.file)
        .then((o) =>
            res.json({
                id: o?.id,
                message: "Project Imported Successfully",
                details: `PID: ${o?.id}`
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

function exportProject(req, res) {
    ProjectService.export(req.params.projectId)
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
    ProjectService.update(req.tenantId, req.auth.id, req.params.projectId, req.body)
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
    ProjectService.delete(req.tenantId, req.params.projectId)
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
    TestSuiteService.list(req.tenantId, req.params.projectId)
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
    TestSuiteService.create(req.tenantId, req.auth.id, req.params.projectId, req.body)
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
    TestSuiteService.get(req.tenantId, req.params.projectId, req.params.suiteId)
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
    TestSuiteService.update(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.body)
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
    TestSuiteService.delete(req.tenantId, req.params.projectId, req.params.suiteId)
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
    TestSuiteService.clone(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.body)
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
    TestCaseService.list(req.tenantId, req.params.suiteId)
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
    TestCaseService.create(req.tenantId, req.auth.id, req.params.suiteId, req.body)
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
    TestCaseService.clone(req.tenantId, req.auth.id, req.params.suiteId, req.params.testcaseId)
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

    TestCaseService.import(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.file.path)
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
    TestCaseService.get(req.tenantId, req.params.suiteId, req.params.testcaseId)
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
    TestCaseService.swap(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.body.target)
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
    TestCaseService.update(req.tenantId, req.auth.id, req.params.projectId, req.params.suiteId, req.params.testcaseId, req.body)
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
    TestCaseService.delete(req.tenantId, req.auth.id, req.params.suiteId, req.params.testcaseId)
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
    SchedulerService.getAllJobs(req.params.projectId)
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
    SchedulerService.getJobById(req.params.jobId)
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
    SchedulerService.createJob(req.auth.id, req.params.projectId, req.body)
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
    SchedulerService.updateJob(req.auth.id, req.params.projectId, req.params.jobId, req.body)
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
    SchedulerService.deleteJob(req.auth.id, req.params.projectId, req.params.jobId)
        .then((o) => res.json(o))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}
