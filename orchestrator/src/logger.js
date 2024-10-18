/**
 ** logger module that initializes log4js settings.
 **/
const log4js = require("log4js"),
  path = require("path"),
  fs = require("fs"),
  fileStreamRotator = require("file-stream-rotator"),
  Morgan = require("morgan"),
  jwt = require("jsonwebtoken");
var logger;

const loggerConfig = global.config.logger;

// create the logs folder if not existing.
let logdir;
if (loggerConfig.logdir) {
  logdir = path.resolve(loggerConfig.logdir);
} else {
  logdir = path.join(__dirname, "/logs");
}
if (!fs.existsSync(logdir)) {
  fs.mkdirSync(logdir);
}

loggerConfig.log4js.appenders.orchestrator.filename = path.join(logdir, loggerConfig.log4js.appenders.orchestrator.filename);

// set up CDR"s logging
const accessLogStream = fileStreamRotator.getStream({
  date_format: "YMD",
  filename: path.join(loggerConfig.logdir, loggerConfig.cdr + "_%DATE%.cdr"),
  frequency: "daily",
  verbose: false
});
Morgan.token("username", function (req) {
  try {
    if (req.headers && req.headers.authorization) {
      let decoded = jwt.decode(req.headers["authorization"].substring(7));
      return (decoded && decoded.loginId) || req.auth?.id || "-";
    }
  } catch (err) {
    logger.error("Error in logging username in access cdrs:", err);
  }
  return req.auth?.id || "-";
});
/**
 *  if User is getting added,deleted,deactivated - user is the event [userid:username]
 *  if app is getting created,archived
 *  plugins -uploaded,enabled/disabled,deleted - pluginId:pluginName(servicename,wsdl)- event
 */
Morgan.token("transactionId", function (req, res) {
  try {
    return req.txnId;
  } catch (err) {
    logger.error("Error in logging event in access cdrs:", err);
  }
  return "-";
});

const morgan = Morgan(loggerConfig.cdrFormat, { stream: accessLogStream });

log4js.configure(loggerConfig.log4js);
logger = log4js.getLogger("leap-log");

logger.level = global.config.LOG_LEVEL;

logger.morgan = morgan;
global.log4js = log4js;
global.logger = logger;

module.exports = logger;
