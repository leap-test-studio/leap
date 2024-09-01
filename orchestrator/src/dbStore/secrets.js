// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secret_name = "/enrich/shared/flow/dev-admin-db";

function GetScrets() {
  return new Promise(async (resolve, reject) => {
    try {
      const client = new SecretsManagerClient({
        region: "us-west-2",
        maxAttempts: 20,
        defaultsMode: "standard"
      });

      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
      resolve(response);
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      reject(error);
    }
  });
}

GetScrets().then((response) => {
  console.log(response);
});
