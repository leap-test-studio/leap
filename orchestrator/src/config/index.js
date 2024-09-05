const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid("production", "development", "test").default("production"),
    PORT: Joi.number().default(9000),
    TIMEZONE: Joi.string().description("Time zone").default("+05:30"),
    EXPRESSJS_SECRET: Joi.string().description("Express Session Secret").default("S3cret"),
    DATABASE_NAME: Joi.string().description("Database name").default("automation"),
    DATABASE_SCHEMA_NAME: Joi.string().description("Database Schema name").default("public"),
    DATABASE_HOST: Joi.string().description("Database server host address").default("localhost"),
    DATABASE_PORT: Joi.number().description("Database server port number").default(3306),
    DATABASE_USERNAME: Joi.string().description("Database username").default("automation"),
    DATABASE_PASSWORD: Joi.string().description("Database password").default("S3cret"),
    DATABASE_DIALECT: Joi.string().description("Database Dialect").default("mysql"),
    DATABASE_MIN_CONNECTIONS: Joi.number().description("Database Minimum Connections").default(1),
    DATABASE_MAX_CONNECTIONS: Joi.number().description("Database Maximum Connections").default(9),
    DATABASE_LOGGING: Joi.boolean().description("Enable logging").default(false),
    AWS_DB_SECRET_ID: Joi.string().description("The ARN or name of the secret to retrieve").default(null),
    LOG_DIR: Joi.string().description("Log directory").default("/tmp"),
    LOG_LEVEL: Joi.string().valid("all", "trace", "debug", "info", "warn", "error", "fatal").default("all"),
    SMTP_ENABLED: Joi.boolean().description("SMTP enabled?").default(false),
    SMTP_FROM: Joi.string().description("SMTP from name"),
    SMTP_HOST: Joi.string().description("SMTP server host address").default("localhost"),
    SMTP_PORT: Joi.number().description("SMTP server port number").default(465),
    SMTP_USER: Joi.string().description("SMTP server user name"),
    SMTP_PASSWORD: Joi.string().description("SMTP server password"),
    REDIS_HOST: Joi.string().description("REDIS server host address").default("localhost"),
    REDIS_PORT: Joi.number().description("REDIS server port number").default(6379),
    REDIS_PASSWORD: Joi.string().description("REDIS server password").default("S3cret"),
    REFRESH_TOKEN_EXPIRY: Joi.string().description("JWT refresh token expiration").default("1d"),
    JWT_TOKEN_EXPIRY: Joi.string().description("JWT token expiration").default("12h"),
    OTP_EXPIRY_TIME: Joi.string().description("OTP expiration time").default("12h"),
    MAX_ALLOWED_OTP: Joi.number().description("Maximum number of allowed OTP").default(5),
    SELENIUM_GRID_URL: Joi.string().description("Selenium grid router URL")
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let noProxy = process.env.no_proxy || process.env.NO_PROXY;
if (noProxy != null) {
  noProxy = noProxy.replace(/;/g, ",");
}
const databaseConfig = {};
if (["mysql", "mariadb", "postgres"].includes(envVars.DATABASE_DIALECT)) {
  databaseConfig.port = envVars.DATABASE_PORT;
  databaseConfig.logging = envVars.DATABASE_LOGGING;
  databaseConfig.pool = {
    minConnections: envVars.DATABASE_MIN_CONNECTIONS,
    maxIdleTime: envVars.DATABASE_MAX_CONNECTIONS
  };
  databaseConfig.dialectOptions = {
    dateStrings: true,
    typeCast: true
  };
  databaseConfig.dialectOptions.timezone = "+05:30";
  databaseConfig.timezone = "+05:30";
}

module.exports = {
  ...envVars,
  security: {
    enabled: false,
    allowedIPs: [],
    allowedRestMethods: ["GET", "POST", "OPTIONS"],
    cors: []
  },
  expressjs: {
    session: {
      name: "session",
      secret: envVars.EXPRESSJS_SECRET,
      cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // week in seconds
      },
      resave: true,
      saveUninitialized: true,
      rolling: true
    }
  },
  smtp: {
    from: envVars.SMTP_FROM,
    smtpOptions: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: true,
      auth: {
        authentication: "plain",
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASSWORD
      }
    }
  },
  logger: {
    logdir: envVars.LOG_DIR,
    cdr: "orchestrator_access",
    cdrFormat: ":date[iso]|:transactionId|:remote-addr|:username|:method|:url|HTTP/:http-version|:status|:response-time|:referrer",
    log4js: {
      appenders: {
        console: { type: "console" },
        orchestrator: {
          type: "dateFile",
          filename: "orchestrator.log",
          pattern: "_yyyy_MM_dd_hh",
          layout: {
            type: "pattern",
            pattern: "%d{ISO8601}|%p|%f{1}:%l|%m"
          }
        }
      },
      categories: { default: { enableCallStack: true, level: envVars.LOG_LEVEL, appenders: ["orchestrator"] } }
    }
  },
  DBstore: {
    host: envVars.DATABASE_HOST,
    username: envVars.DATABASE_USERNAME,
    password: envVars.DATABASE_PASSWORD,
    database: envVars.DATABASE_NAME,
    schemaName: envVars.DATABASE_SCHEMA_NAME,
    dialect: envVars.DATABASE_DIALECT,
    ...databaseConfig
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD
  },
  bypass: process.env.no_proxy || process.env.NO_PROXY,
  proxy: process.env.proxy || process.env.PROXY
};
