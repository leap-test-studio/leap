const request = require("axios");

module.exports = (params) => {
  const { url, method, json = {} } = params;
  return new Promise((resolve) => {
    const options = {
      url: url,
      method,
      json,
      timeout: 5000
    };
    request(options, function (err, resp, body) {
      if (err != null) {
        logger.error("Exception", err);
        return resolve({
          statusCode: 500,
          body: {
            message: "External Service is down please try after sometime."
          }
        });
      }
      resolve({ statusCode: resp.statusCode, body });
    });
  });
};
