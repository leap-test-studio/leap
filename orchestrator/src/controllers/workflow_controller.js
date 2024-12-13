const express = require("express");
const Joi = require("joi");
const { status } = require("http-status");
const { RoleGroups, E_ROLE } = require("engine_utils");

const router = express.Router();
const WorkflowService = require("../services/workflow_service");
const Authorizer = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");
const validateRequest = require("../_middleware/validate-request");

// routes
router.get("/:projectId/list", csrf, Authorizer(), listWorkflows);
router.post("/", csrf, Authorizer(RoleGroups.Leads), workflowSchema, createWorkflow);
router.post("/:workflowId/trigger", csrf, Authorizer.ci, Authorizer(), triggerSequence);
router.get("/:workflowId", csrf, Authorizer(), getWorkflow);
router.put("/:workflowId", csrf, Authorizer(RoleGroups.Leads), updateWorkflowSchema, updateWorkflow);
router.delete("/:workflowId", csrf, Authorizer(E_ROLE.Admin), _deleteWorkflow);

module.exports = router;

// Workflow functions
function workflowSchema(req, _, next) {
    validateRequest(req, next, {
        name: Joi.string().min(4).required(),
        description: Joi.string().default(""),
        ProjectMasterId: Joi.string().required(),
        nodes: Joi.array().optional().default([]),
        edges: Joi.array().optional().default([]),
        cron: Joi.string().default(""),
        type: Joi.number()
    });
}

function updateWorkflowSchema(req, _, next) {
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

function listWorkflows(req, res) {
    WorkflowService.list(req.params.projectId)
        .then((o) => res.json(o))
        .catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function createWorkflow(req, res) {
    WorkflowService.create(req.auth.id, req.body)
        .then((o) =>
            res.json({
                id: o?.id,
                message: `Workflow '${req.body.name}' Created Successfully.`
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

function getWorkflow(req, res) {
    WorkflowService.get(req.params.workflowId)
        .then((o) => res.json(o))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function updateWorkflow(req, res) {
    WorkflowService.update(req.params.workflowId, req.body)
        .then((data) => res.json({ message: `Workflow[${data.name}] Changes Saved Successfully.`, ...data }))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function _deleteWorkflow(req, res) {
    WorkflowService.delete(req.params.workflowId)
        .then(() => res.json({ message: "Workflow Deleted Successfully." }))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

// Build Runner functions
function triggerSequence(req, res) {
    logger.info("triggerSequence", req.params.workflowId);
    WorkflowService.triggerSequence(req.auth.id, req.params.workflowId)
        .then((response) => res.status(status.ACCEPTED).json(response))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({ error: err.message, message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`] });
        });
}
