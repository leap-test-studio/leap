const express = require("express");
const Joi = require("joi");
const status = require("http-status");

const router = express.Router();
const TestPlanService = require("../services/testplan_service");
const AuthRoles = require("../_helpers/role");
const Role = require("../_helpers/role").Role;
const Authorizer = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");
const validateRequest = require("../_middleware/validate-request");

// routes
router.get("/:projectId/list", csrf, Authorizer(), listTestPlans);
router.post("/", csrf, Authorizer(AuthRoles.Leads), planSchema, createTestPlan);
router.get("/:planId", csrf, Authorizer(), getTestPlan);
router.put("/:planId", csrf, Authorizer(AuthRoles.Leads), updatePlanSchema, updateTestPlan);
router.delete("/:planId", csrf, Authorizer(Role.Admin), _deleteTestPlan);

module.exports = router;

// TestPlan functions
function planSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).required(),
    description: Joi.string(),
    ProjectMasterId: Joi.string().required(),
    nodes: Joi.array().optional().default([]),
    edges: Joi.array().optional().default([]),
    cron: Joi.string().optional(),
    type: Joi.number().optional()
  });
}

function updatePlanSchema(req, _, next) {
  validateRequest(req, next, {
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    ProjectMasterId: Joi.string().required(),
    nodes: Joi.array().optional().default([]),
    edges: Joi.array().optional().default([]),
    cron: Joi.string().optional(),
    type: Joi.number().optional()
  });
}

function listTestPlans(req, res) {
  TestPlanService.list(req.params.projectId)
    .then((o) => res.json(o))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function createTestPlan(req, res) {
  TestPlanService.create(req.auth.id, req.body)
    .then((o) =>
      res.json({
        id: o?.id,
        message: `TestPlan '${req.body.name}' Created Successfully.`
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

function getTestPlan(req, res) {
  TestPlanService.get(req.params.planId)
    .then((o) => res.json(o))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function updateTestPlan(req, res) {
  TestPlanService.update(req.params.planId, req.body)
    .then((data) => res.json({ message: `TestPlan[${data.name}] Changes Saved Successfully.`, ...data }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function _deleteTestPlan(req, res) {
  TestPlanService.delete(req.params.planId)
    .then(() => res.json({ message: "TestPlan Deleted Successfully." }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}
