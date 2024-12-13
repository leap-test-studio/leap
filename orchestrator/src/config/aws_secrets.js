const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { DEFAULT_DB_SECRET_ID, DEFAULT_SLACK_SECRET_ID } = require("../constants");

const AWSClient = new SecretsManagerClient({
    region: "us-west-2",
    maxAttempts: 20,
    defaultsMode: "standard",
    serviceId: "secretmanager"
});

function InitDbConfig() {
    return new Promise(async (resolve) => {
        try {
            const command = new GetSecretValueCommand({
                SecretId: global.config?.AWS_DB_SECRET_ID || DEFAULT_DB_SECRET_ID, // required
                VersionStage: "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified
            });
            const response = await AWSClient.send(command);
            if (response?.SecretString) {
                const payload = JSON.parse(response.SecretString);
                if (global.config?.DBstore) {
                    global.config.DBstore.host = payload["bigdata_admin_host"];
                    global.config.DBstore.database = payload["bigdata_admin_db_name"];
                    global.config.DBstore.username = payload["bigdata_admin_user"];
                    global.config.DBstore.password = payload["bigdata_admin_password"];
                    global.config.DBstore.port = payload["bigdata_admin_port"];
                }
                resolve();
            } else {
                logger.error("Failed to Fetch Details from AWS", response);
                resolve("Failed to Fetch Details from AWS", response);
            }
        } catch (error) {
            logger.error("Failed to Read DB Config from AWS", error);
            resolve(error);
        }
    });
}

function InitSlackConfig() {
    return new Promise(async (resolve) => {
        try {
            const command = new GetSecretValueCommand({
                SecretId: global.config?.AWS_SLACK_SECRET_ID || DEFAULT_SLACK_SECRET_ID, // required
                VersionStage: "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified
            });
            const response = await AWSClient.send(command);
            if (response?.SecretString) {
                const payload = JSON.parse(response.SecretString);
                global.config.SLACK_BOT_TOKEN = payload["SLACK_API_TOKEN"];
                resolve();
            } else {
                logger.error("Failed to Fetch Details from AWS", response);
                resolve("Failed to Fetch Details from AWS", response);
            }
        } catch (error) {
            logger.error("Failed to Read Slack Config from AWS", error);
            resolve(error);
        }
    });
}

module.exports.InitDbConfig = InitDbConfig;
module.exports.InitSlackConfig = InitSlackConfig;
