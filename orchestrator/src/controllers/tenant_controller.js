const express = require("express");
const Joi = require("joi");
const { status } = require("http-status");
const { RoleGroups, E_ROLE } = require("engine_utils");

const router = express.Router();
const service = require("../services/tenant_service");
const Authorizer = require("../_middleware/authorize");
const csrf = require("../_middleware/checkCSRF");
const validateRequest = require("../_middleware/validate-request");
// routes

router.get("/", csrf, Authorizer(RoleGroups.Admins), listTenants);
router.post("/", csrf, Authorizer(E_ROLE.Admin), tenantSchema, createTenant);
router.get("/:tenantId", csrf, Authorizer(RoleGroups.All), getTenant);
router.put("/:tenantId", csrf, Authorizer(E_ROLE.Admin), tenantSchema, updateTenant);
router.delete("/:tenantId", csrf, Authorizer(E_ROLE.Admin), _deleteTenant);

module.exports = router;

// Tenant functions
function tenantSchema(req, _, next) {
    validateRequest(req, next, {
        name: Joi.string().min(4).required(),
        description: Joi.string()
    });
}

function listTenants(req, res) {
    service
        .list()
        .then((o) => res.json(o))
        .catch((err) => {
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function createTenant(req, res) {
    service
        .create(req.body)
        .then((o) =>
            res.json({
                id: o?.id,
                message: `Tenant '${req.body.name}' Created Successfully.`
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

function getTenant(req, res) {
    service
        .get(req.params.tenantId)
        .then((o) => res.json(o))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function updateTenant(req, res) {
    service
        .update(req.params.tenantId, req.body)
        .then((data) => res.json({ message: `Tenant[${data.name}] Changes Saved Successfully.`, ...data }))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}

function _deleteTenant(req, res) {
    service
        .delete(req.params.tenantId)
        .then(() => res.json({ message: "Tenant Deleted Successfully." }))
        .catch((err) => {
            logger.error(err);
            res.status(status.INTERNAL_SERVER_ERROR).send({
                error: err.message,
                message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
            });
        });
}
