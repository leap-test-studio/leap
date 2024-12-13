const { E_TEST_TYPE } = require("engine_utils");

const WebTestRunner = require("./WebTestRunner");
const APITestRunner = require("./APITestRunner");
const SSHTestRunner = require("./SSHTestRunner");
const DefaultTestRunner = require("./DefaultTestRunner");

module.exports = {
    createRunner: (taskInfo) => {
        logger.info("Create Test handler:", JSON.stringify(taskInfo));
        switch (taskInfo.type) {
            case E_TEST_TYPE.API:
                return new APITestRunner(taskInfo);
            case E_TEST_TYPE.WEB:
                return new WebTestRunner(taskInfo);
            case E_TEST_TYPE.SSH:
                return new SSHTestRunner(taskInfo);
            default:
                return new DefaultTestRunner(taskInfo);
        }
    }
};
