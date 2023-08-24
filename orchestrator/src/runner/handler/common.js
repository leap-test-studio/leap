const request = require("request");

module.exports.httpRequest = (req) => {
  let diagnostics = {
    statusCode: 999
  };
  return new Promise((resolve) => {
    req.withCredentials = false;
    req.securityOptions = "TLSv1_2_method";
    req.time = true;

    request(req, (error, response, body) => {
      if (response != null) {
        diagnostics.elapsedTime = response.elapsedTime;
        diagnostics.responseStartTime = response.responseStartTime;
        diagnostics.timingStart = response.timingStart;
        diagnostics.timings = response.timings;
        diagnostics.timingPhases = response.timingPhases;
      }
      if (error) {
        global.logger.error(error);
        diagnostics.response = response;

        if (error.code == "ESOCKETTIMEDOUT" || error.code == "ETIMEDOUT") {
          diagnostics.status = 900;
          diagnostics.statusMessage = "Execution timedout:" + error.code;
        } else if (error.code == "ECONNRESE" || error.code == "ECONNRESET") {
          diagnostics.status = 901;
        } else {
          diagnostics.statusMessage = "Internal Error:" + error.code;
          diagnostics.status = error.code;
        }
        resolve(diagnostics);
      } else {
        if (response) {
          diagnostics.timings = response.timings;
          diagnostics.statusCode = response.statusCode;
          diagnostics.statusMessage = response.statusMessage;
          diagnostics.body = body;
          diagnostics.headers = response.headers;
        }
        resolve(diagnostics);
      }
    });
  });
};
