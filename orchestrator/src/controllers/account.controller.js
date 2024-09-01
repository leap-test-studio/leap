const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../_middleware/validate-request");
const authorize = require("../_middleware/authorize");
const AuthRoles = require("../_helpers/role");
const Role = require("../_helpers/role").Role;
const service = require("../services/account.service");
const moment = require("moment");
const NAME_REGEX = /^[a-zA-Z0-9_ ]{4,25}$/;
const NAME_RULE = {
  message:
    "Filed 'name' can contain lowercase/uppercase alphabetical characters, numeric characters and space. Mininum of 8 characters. Maxinum of 25 characters."
};
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
const PASSWORD_RULE = {
  message:
    "Password must contain \n\t*. at least 1 lowercase alphabetical character.\n\t*. at least 1 uppercase alphabetical character.\n\t*. at least 1 numeric character.\n\t*. at least one special character !@#$%^&\n\t*. Mininum of 8 characters"
};
const checkCSRF = require("../_middleware/checkCSRF");
const uuid = require("uuid");
const status = require("http-status");
const { getLocalTime } = require("../utils");

// routes
router.post("/authenticate", authenticateSchema, authenticate);
router.post("/refresh-token", checkCSRF, refreshTokenMW);
router.post("/revoke-token", checkCSRF, authorize(), revokeTokenSchema, revokeToken);
router.post("/register", registerSchema, register);
router.get("/verify-email", verifyEmailByQs);
router.post("/verify-email", verifyEmailSchema, verifyEmail);
router.post("/change-password", checkCSRF, authorize(), changePasswordSchema, changePassword);
router.post("/forgot-password", forgotPasswordSchema, forgotPassword);
router.post("/validate-reset-token", validateResetTokenSchema, validateResetToken);

router.post("/reset-password", resetPasswordSchema, resetPassword);
router.get("/:tenantId/role/:role", checkCSRF, authorize(AuthRoles.Admins), getAllAccountsByRole);
router.get("/", checkCSRF, authorize(AuthRoles.Admins), getAllAccounts);

router.get("/:id", authorize(), getById);
router.post("/", authorize(AuthRoles.Admins), accountSchema, create);
router.put("/:id", authorize(AuthRoles.Admins), updateAccountSchema, update);

module.exports = router;

function authenticateSchema(req, res, next) {
  validateRequest(req, next, {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
}

function authenticate(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  req.session.csrfToken = uuid.v4();
  service
    .authenticate({
      email,
      password,
      ipAddress,
      userAgent: req.headers["user-agent"]
    })
    .then(({ refreshToken, ...account }) => {
      return res.json({
        ...account,
        refreshToken,
        csrfToken: req.session.csrfToken
      });
    })
    .catch((err) => {
      logger.error(err);
      return res.status(status.BAD_REQUEST).send({
        error: err.message,
        message: status[`${status.BAD_REQUEST}_MESSAGE`]
      });
    });
}

function refreshTokenMW(req, res) {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token == null) {
    return res.status(status.UNAUTHORIZED).send({
      error: "Token Not Valid",
      message: status[`${status.UNAUTHORIZED}_MESSAGE`]
    });
  }
  const ipAddress = req.ip;
  service
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...account }) => {
      res.json({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        isVerified: account.isVerified,
        jwtToken: account.jwtToken,
        refreshToken,
        tenant: account.tenant,
        csrfToken: req.session.csrfToken
      });
    })
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function revokeTokenSchema(req, res, next) {
  validateRequest(req, next, {
    token: Joi.string().empty("")
  });
}

function revokeToken(req, res) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token)
    return res.status(status.BAD_REQUEST).send({
      error: "Token is required",
      message: status[`${status.BAD_REQUEST}_MESSAGE`]
    });

  // users can revoke their own tokens and admins can revoke any tokens
  if (!req.auth.ownsToken(token) && req.auth.role !== Role.Admin) {
    return res.status(status.UNAUTHORIZED).send({
      error: "Unauthorized to Revoke",
      message: status[`${status.UNAUTHORIZED}_MESSAGE`]
    });
  }

  service
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function registerSchema(req, res, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).regex(NAME_REGEX).rule(NAME_RULE),
    email: Joi.string().email().required(),
    contact: Joi.string(),
    country: Joi.string(),
    password: Joi.string().min(8).regex(PASSWORD_REGEX).rule(PASSWORD_RULE),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "Confirm Password does not match" }),
    acceptTerms: Joi.boolean().valid(true)
  });
}

function register(req, res) {
  service
    .register(req.body)
    .then((result) => {
      res.json({
        message: "Registration successful, please check your email for verification instructions"
      });
    })
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function verifyEmailSchema(req, res, next) {
  validateRequest(req, next, {
    token: Joi.string().required(),
    email: Joi.string().email().required()
  });
}

function verifyEmailByQs(req, res) {
  service
    .verifyEmailByQs(req.query.token)
    .then(() => res.json({ message: "Verification successful, you can now login" }))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function verifyEmail(req, res) {
  service
    .verifyEmail(req.body)
    .then(() => res.json({ message: "Verification successful, you can now login" }))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function changePasswordSchema(req, res, next) {
  validateRequest(req, next, {
    oldPassword: Joi.string().min(8).required(),
    password: Joi.string().min(8).regex(PASSWORD_REGEX).rule(PASSWORD_RULE),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "Confirm Password does not match" })
  });
}

function changePassword(req, res) {
  if (req.body.oldPassword === req.body.password) {
    return res.status(status.BAD_REQUEST).send({
      error: "New password cannot be same as old password",
      message: status[`${status.BAD_REQUEST}_MESSAGE`]
    });
  }
  service
    .changePassword(req.auth.id, req.body)
    .then(() =>
      res.send({
        message: "Password changed successfully, you can now login with the new password"
      })
    )
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function forgotPasswordSchema(req, res, next) {
  validateRequest(req, next, {
    email: Joi.string().email().required()
  });
}

function forgotPassword(req, res) {
  service
    .forgotPassword(req.body)
    .then(() =>
      res.json({
        message: "Please check your email for password reset instructions"
      })
    )
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: "Please check your email for password reset instructions",
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function validateResetTokenSchema(req, res, next) {
  validateRequest(req, next, {
    token: Joi.string().required(),
    email: Joi.string().email().required()
  });
}

function validateResetToken(req, res) {
  service
    .validateResetToken(req.body)
    .then(() => res.json({ message: "Token is valid" }))
    .catch((err) => {
      logger.error(err);
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function resetPasswordSchema(req, res, next) {
  validateRequest(req, next, {
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().min(8).regex(PASSWORD_REGEX).rule(PASSWORD_RULE),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "Confirm Password does not match" })
  });
}

function resetPassword(req, res) {
  service
    .resetPassword(req.body)
    .then(() => res.json({ message: "Password reset successful, you can now login" }))
    .catch(() =>
      res.status(status.BAD_REQUEST).send({
        error: "Please enter valid token",
        message: status[`${status.BAD_REQUEST}_MESSAGE`]
      })
    );
}

function getAllAccounts(req, res) {
  service
    .getAllAccounts()
    .then((accounts) => res.json(accounts))
    .catch((err) =>
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      })
    );
}

function getAllAccountsByRole(req, res) {
  service
    .getAllAccountsByRole({ ...req.query, ...req.params })
    .then((accounts) => res.json(accounts))
    .catch((err) =>
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      })
    );
}

function getById(req, res) {
  // users can get their own account and admins can get any account
  if (Number(req.params.id) !== req.auth.id && req.auth.role !== Role.Admin) {
    return res.status(status.UNAUTHORIZED).send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
  }

  service
    .getAccountById(req.params.id)
    .then((account) => (account ? res.json(account) : res.sendStatus(404)))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function accountSchema(req, res, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).regex(NAME_REGEX).rule(NAME_RULE),
    email: Joi.string().email().required(),
    TenantId: Joi.string().allow(null, "").optional(),
    password: Joi.string().min(8).regex(PASSWORD_REGEX).rule(PASSWORD_RULE),
    confirmPassword: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .messages({ "any.only": "Confirm Password does not match" }),
    role: Joi.string()
      .valid(...AuthRoles.All)
      .required()
  });
}
function updateAccountSchema(req, res, next) {
  validateRequest(req, next, {
    name: Joi.string().min(4).regex(NAME_REGEX).rule(NAME_RULE),
    TenantId: Joi.string().allow(null, "").optional(),
    role: Joi.string()
      .valid(...AuthRoles.All)
      .required()
  });
}

function create(req, res) {
  req.body.activationDt = getLocalTime();
  req.body.expiryDt = moment().add(10, "y").format("YYYY-MM-DD hh:mm:ss");
  service
    .create(req.body, req.auth.id)
    .then((account) => res.json(account))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}

function update(req, res) {
  // users can update their own account and admins can update any account
  if (Number(req.params.id) !== req.auth.id && req.auth.role !== Role.Admin && req.auth.role !== Role.Lead) {
    return res.status(status.UNAUTHORIZED).send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
  }

  service
    .update(req.params.id, req.body, req.auth.id, req.auth.role)
    .then((account) => res.json(account))
    .catch((err) => {
      res.status(status.INTERNAL_SERVER_ERROR).send({
        error: err.message,
        message: status[`${status.INTERNAL_SERVER_ERROR}_MESSAGE`]
      });
    });
}
