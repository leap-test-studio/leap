const APICallbackHandler = require("./APICallbackHandler");
const RedisCallbackHandler = require("./RedisCallbackHandler");

const ENABLED_CALLBACK = {
    http: true,
    kafka: false,
    redis: true
};

module.exports = async function (job) {
    const request = Object.freeze(job.callback);
    switch (ENABLED_CALLBACK[request?.type] ? request?.type : null) {
        case "http":
            return await APICallbackHandler(request);
        case "redis":
            return await RedisCallbackHandler(request);
        default:
            return null;
    }
};
