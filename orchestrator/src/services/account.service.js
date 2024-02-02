const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const crypto = require("crypto");
const { Op } = require("sequelize");
const timeParser = require("parse-duration");
const RedisMan = require("whiteboard-pubsub").RedisMan;

const sendEmail = require("../_helpers/send-email");
const Role = require("../_helpers/role");
const { getPagination, getPagingData } = require("../utils");

const API_URL = process.env.PUBLIC_URL + "/api/v1";
const OTP_EXPIRY_TIME = timeParser(global.config.OTP_EXPIRY_TIME);
const REFRESH_TOKEN_EXPIRY = timeParser(global.config.REFRESH_TOKEN_EXPIRY);
const TOKEN_EXPIRY = global.config.JWT_TOKEN_EXPIRY;
const CLIENT_NAME = process.env.CLIENT_NAME || "Automation Suite";
const PRIV_KEY = fs.readFileSync(path.join(__dirname, "../..", "/keys/id_rsa_priv.pem"), "utf8");
const MAX_ALLOWED_OTP = global.config.MAX_ALLOWED_OTP;

module.exports = {
  authenticate,
  refreshToken,
  revokeToken,
  register,
  verifyEmailByQs,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  changePassword,
  resetPassword,
  create,
  update,
  delete: _delete,
  getAllAccounts,
  getAllAccountsByRole,
  getAccountById
};

function getTotalAccounts() {
  return global.DbStoreModel.Account.count();
}

async function getAllAccounts(custID = null) {
  const accounts = await global.DbStoreModel.Account.findAll({
    where: { managerId: custID },
    order: [["created", "DESC"]]
  });

  return accounts.map((x) => accountBasicDetails(x));
}

function accountBasicDetails(account) {
  const { id, name, email, role, created, updated, isVerified, managerId } = account;

  return {
    id,
    name,
    email,
    role,
    created,
    updated,
    isVerified,
    managerId
  };
}

async function getAllAccountsByRole({ page, size, token, role }) {
  if (token == null) token = "";
  let { limit, offset } = getPagination(page, size);
  let accounts, data;
  if ([Role.Manager].includes(role)) {
    data = await global.DbStoreModel.Account.findAndCountAll({
      where: {
        [Op.or]: [
          {
            name: { [Op.like]: `%${token}%` }
          },
          {
            email: { [Op.like]: `%${token}%` }
          }
        ],
        role
      },
      limit,
      offset
    });
  } else {
    data = await global.DbStoreModel.Account.findAndCountAll();
  }
  accounts = getPagingData(data, page, limit);
  accounts.items = accounts.items.map((x) => accountBasicDetails(x));
  return accounts;
}

async function getAccountById(id) {
  const account = await global.DbStoreModel.Account.findByPk(id);
  return accountBasicDetails(account);
}

async function authenticate({ email, password, ipAddress, userAgent }) {
  const account = await global.DbStoreModel.Account.scope("withHash").findOne({
    where: { email }
  });
  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    let msg = "Email or password is incorrect";
    if (userAgent === "Automation-Mobile") {
      msg += "\nIn case you do not have an account, please Signup";
    }
    throw new Error(msg);
  }

  if (!account.isActivated || !account.isVerified) {
    throw new Error("User account activation is pending.");
  }

  if (!account.isExpired) {
    throw new Error("User account has expired");
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(account);

  const rt = generateRefreshToken(account, ipAddress);

  // save refresh token
  await rt.save();

  // return basic details and tokens
  return {
    ...accountBasicDetails(account),
    jwtToken,
    refreshToken: rt.token
  };
}

async function refreshToken({ token, ipAddress }) {
  const rt = await global.DbStoreModel.RefreshToken.findOne({ where: { token } });
  const account = await rt.getAccount();
  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(account, ipAddress);
  rt.revoked = Date.now();
  rt.revokedByIp = ipAddress;
  rt.replacedByToken = newRefreshToken.token;
  await rt.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(account);

  // return basic details and tokens
  return {
    ...accountBasicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token
  };
}

async function revokeToken({ token, ipAddress }) {
  const rt = await global.DbStoreModel.RefreshToken.findOne({ where: { token } });

  // revoke token and save
  rt.revoked = Date.now();
  rt.revokedByIp = ipAddress;
  await rt.save();
}

function register(params) {
  return new Promise(async (resolve) => {
    // validate
    const info = await getAccountByEmail(params.email);
    if (info) {
      // send already registered error in email to prevent account enumeration
      resolve(false);
      try {
        return await sendAlreadyRegisteredEmail(info);
      } catch (error) {
        logger.error(error);
      }
    }

    params.activationDt = Date.now();
    params.expiryDt = moment().add(10, "y").format("YYYY-MM-DD hh:mm:ss");

    // create account object
    const account = new global.DbStoreModel.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await getTotalAccounts()) === 0;
    if (isFirstAccount) {
      account.role = Role.Admin;
      account.verificationToken = randomTokenString();
    } else {
      account.role = Role.Engineer;
      account.verificationToken = generateOTP();
    }
    console.log(account.verificationToken);
    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();
    resolve(true);
    // send email
    try {
      await sendVerificationEmail(account);
    } catch (error) {
      logger.error(error);
    }
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

async function verifyEmailByQs(token) {
  const account = await global.DbStoreModel.Account.findOne({
    where: { verificationToken: token }
  });

  if (!account) {
    const key = "automation:account:user:" + account.email;
    const connection = await RedisMan.getConnection();
    if ((await connection.get(key)) >= MAX_ALLOWED_OTP) {
      await connection.expire(key, OTP_EXPIRY_TIME);
      throw new Error("You exceeded OTP request max attempt.");
    } else {
      await connection.incr(key);
      throw new Error("Verification failed");
    }
  }

  account.verified = Date.now();
  account.verificationToken = null;
  await account.save();
}

async function verifyEmail({ token, email }) {
  const account = await global.DbStoreModel.Account.findOne({
    where: { verificationToken: token, email }
  });

  if (!account) {
    const key = "automation:account:user:" + email;
    const connection = await RedisMan.getConnection();
    if ((await connection.get(key)) >= MAX_ALLOWED_OTP) {
      await connection.expire(key, OTP_EXPIRY_TIME);
      throw new Error("You exceeded OTP request max attempt.");
    } else {
      await connection.incr(key);
      throw new Error("Verification failed");
    }
  }

  account.verified = Date.now();
  account.verificationToken = null;
  await account.save();
}

function forgotPassword({ email }) {
  return new Promise(async (resolve, reject) => {
    const account = await getAccountByEmail(email);
    // always return ok response to prevent email enumeration
    if (!account) return reject("We're sorry. We weren't able to identify you given the information provided.");

    account.resetToken = generateOTP();
    account.resetTokenExpires = new Date(Date.now() + OTP_EXPIRY_TIME);
    resolve(await account.save());
    await sendPasswordResetOTP(account);
  });
}

async function validateResetToken({ token, email }) {
  const account = await global.DbStoreModel.Account.findOne({
    where: {
      email: email,
      resetToken: token,
      resetTokenExpires: { [Op.gt]: Date.now() }
    }
  });
  if (!account) throw new Error("Please enter valid token");
  return account;
}

async function changePassword(userID, params) {
  return new Promise(async (resolve, reject) => {
    const account = global.DbStoreModel.Account.scope("withHash").findByPk(userID);

    if (!account || !account.isVerified) {
      reject("Account not Found. Please check if you have a verified and active account.");
    } else if (!(await bcrypt.compare(params.oldPassword, account.passwordHash))) {
      reject("Old Password doesn't match");
    }

    // update password
    account.passwordHash = await hash(params.password);
    account.passwordReset = Date.now();
    resolve(await account.save());
    sendPasswordResetEmail(account);
  });
}

async function resetPassword({ email, token, password }) {
  return new Promise(async (resolve, reject) => {
    try {
      const account = await validateResetToken({ email, token });

      // update password and remove reset token
      account.passwordHash = await hash(password);
      account.passwordReset = Date.now();
      account.resetToken = null;
      resolve(await account.save());
      sendPasswordResetEmail(account);
    } catch (error) {
      reject(error);
    }
  });
}

async function create(params, userID = null) {
  // validate
  if (await getAccountByEmail(params.email)) {
    throw new Error('Email "' + params.email + '" is already registered');
  }

  if (params.role === Role.Admin) {
    Object.assign(params, { addedbyId: userID });
  }

  if (params.role === Role.Engineer) {
    Object.assign(params, { managerId: userID });
  }

  const account = new global.DbStoreModel.Account(params);
  account.verified = Date.now();

  // hash password
  account.passwordHash = await hash(params.password);

  // save account
  await account.save();

  // send email
  sendOnboardEmail(account, params.password);
  return accountBasicDetails(account);
}

async function getAccountByEmail(email) {
  return await global.DbStoreModel.Account.findOne({
    where: { email }
  });
}

async function update(id, params, userID, userRole) {
  const account = await getAccountById(id);

  if (userRole === "Customer" && account.managerId !== userID) {
    throw new Error("The staff does not belong to your Organization");
  }

  // validate (if email was changed)
  if (params.email && account.email !== params.email && (await getAccountByEmail(params.email))) {
    throw new Error('Email "' + params.email + '" is already taken');
  }

  // hash password if it was entered
  if (params.password) {
    params.passwordHash = await hash(params.password);
  }

  // copy params to account and save
  Object.assign(account, params);
  account.updated = Date.now();
  await account.save();
  return accountBasicDetails(account);
}

async function _delete(id) {
  const account = await global.DbStoreModel.Account.findByPk(id);
  return await account.destroy();
}

// helper functions

async function hash(password) {
  return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
  // create a jwt token containing the account id that expires in 15 minutes
  return jwt.sign({ sub: account.id, id: account.id }, PRIV_KEY, {
    expiresIn: TOKEN_EXPIRY,
    algorithm: "RS256"
  });
}

function generateRefreshToken(account, ipAddress) {
  return new global.DbStoreModel.RefreshToken({
    AccountId: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY).getTime(),
    createdByIp: ipAddress
  });
}

const DIGITS = "0123456789";
function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += DIGITS[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

async function sendOnboardEmail(account, password) {
  try {
    return await sendEmail(
      account.email,
      [Role.Manager, Role.Lead, Role.Engineer].includes(account.role) ? "welcome-manager.html" : "welcome-admin.html",
      {
        activationLink: API_URL + "/accounts/verify-otp",
        name: account.name,
        loginId: account.email,
        password
      },
      `Welcome to ${CLIENT_NAME}`
    );
  } catch (error) {
    logger.error(error);
  }
}

async function sendVerificationEmail(account) {
  const verifyUrl =
    account.role === Role.Admin ? `${API_URL}/accounts/verify-email?token=${account.verificationToken}` : `${account.verificationToken}`;
  const activationLinkValidity = 3;

  return await sendEmail(
    account.email,
    account.role === Role.Admin ? "welcome.html" : "verification-code.html",
    {
      activationLink: verifyUrl,
      name: account.name,
      loginId: account.email,
      activationLinkValidity: activationLinkValidity
    },
    `Welcome to ${CLIENT_NAME}`
  );
}

async function sendAlreadyRegisteredEmail(account) {
  const verifyUrl = `${API_URL}/forgot-password`;

  return await sendEmail(
    account.email,
    "account-already.html",
    { activationLink: verifyUrl, loginId: account.email, name: account.name },
    "Email Already Registered"
  );
}

async function sendPasswordResetEmail(account) {
  try {
    const resetUrl = `${API_URL}/account/reset-password?token=${account.resetToken}`;
    return await sendEmail(
      account.email,
      "password-reset.html",
      { activationLink: resetUrl, loginId: account.email, name: account.name },
      `Revision to Your ${CLIENT_NAME} Account`
    );
  } catch (error) {
    logger.error(error);
  }
}

async function sendPasswordResetOTP(account) {
  try {
    return await sendEmail(
      account.email,
      "verification-code.html",
      {
        activationLink: account.resetToken,
        loginId: account.email,
        name: account.name
      },
      `${CLIENT_NAME} password assistance`
    );
  } catch (error) {
    logger.error(error);
  }
}
