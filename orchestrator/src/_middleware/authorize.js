const { expressjwt: jwt } = require("express-jwt");
const { jwtDecode } = require("jwt-decode");
const fs = require("fs");
const path = require("path");
const { status } = require("http-status");
const { isEmpty } = require("lodash");
const PUB_KEY = fs.readFileSync(path.join(__dirname, "../..", "/keys/id_rsa_pub.pem"), "utf8");

module.exports = authorize;

function authorize(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  const OktaMiddleware = async (req, res, next) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    if (isEmpty(token) || token == "undefined") return res.status(status.UNAUTHORIZED).send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });

    if (req.ciaccount) {
      req.auth = req.ciaccount;
      req.tenantId = req.ciaccount.TenantId;
    } else {
      const auth = jwtDecode(token);
      const account = await global.DbStoreModel.Account.findOne({
        where: {
          email: auth.sub
        }
      });
      if (!account || (roles.length && !roles.includes(account.role))) {
        // account no longer exists or role not authorized
        return res.status(status.UNAUTHORIZED).send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
      }
      // authentication and authorization successful
      req.auth = account;
      req.tenantId = account.TenantId;
    }
    next();
  };

  // authorize based on user role
  const RoleAutorizationMiddleware = async (req, res, next) => {
    const account = await global.DbStoreModel.Account.findByPk(req.auth.id);
    if (!account || (roles.length && !roles.includes(account.role))) {
      // account no longer exists or role not authorized
      return res.status(status.UNAUTHORIZED).send({ message: status[`${status.UNAUTHORIZED}_MESSAGE`] });
    }

    // authentication and authorization successful
    req.auth = account;
    req.tenantId = account.TenantId;
    const refreshTokens = await account.getRefreshTokens();
    req.auth.ownsToken = (token) => !!refreshTokens.find((x) => x.token === token);
    next();
  };

  const middlewares = [];
  if (global.config.OKTA_ENABLED) {
    middlewares.push(OktaMiddleware);
  } else {
    middlewares.push(jwt({ secret: PUB_KEY, algorithms: ["RS256"] }));
    middlewares.push(RoleAutorizationMiddleware);
  }
  return middlewares;
}
