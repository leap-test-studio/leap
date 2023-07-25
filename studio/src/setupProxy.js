const { createProxyMiddleware } = require("http-proxy-middleware");
const SERVER_URL = process.env.SERVER_URL || "http://localhost";
module.exports = function (app) {
  app.use(createProxyMiddleware("/api", { target: SERVER_URL, logLevel: "debug" }));
};
