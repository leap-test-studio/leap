const http = require("http");
const https = require("https");

/*
curl --location 'https://ebates.okta.com/oauth2/default/v1/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Cookie: JSESSIONID=EC916AA544AB66E18751556FF6D8153E' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'client_id=0oa1t5w51ytlNB70N0h8' \
--data-urlencode 'client_secret=_2NsHqK6B_jBsFCEVVGCtmBZqOmZPMV-qd8-1R73AAtF7UVV1_LnyZ5v6SSSxhsC' \
--data-urlencode 'scope=api:direct-access'

curl 'https://leap.dataplatform-np.rr-it.com/api/v1/runner/6a1eb759-37a1-4ee5-a097-b54dd1ce3dd0/runProject' -H 'Authorization: Bearer ci' -H 'Content-Type: application/json'   --data-raw '{"env":[{"key":"RELEASE_VERSION","value":"<PASS Binary Version Tag>"},{"key":"API_URL","value":"https://enrich-data-portal-dev.nonprod.dna.rr-it.com"},{"key":"API_PREVIEW_URL","value":"https://enrich-data-portal-preview.prod.dna.rr-it.com"},{"key":"JWT_TOKEN","value":"<Pass the access-token received from above request>"},{"key":"TEAM_NAME","value":"admin"}]}'

*/

function generateAccessToken() {
  return new Promise((resolve, reject) => {
    try {
      const options = {
        hostname: "ebates.okta.com",
        path: "/oauth2/default/v1/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: "JSESSIONID=EC916AA544AB66E18751556FF6D8153E"
        }
      };
      const req = https.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          const body = Buffer.concat(chunks);
          resolve(JSON.parse(body.toString()));
        });
      });

      req.write(
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "0oa1t5w51ytlNB70N0h8",
          client_secret: "_2NsHqK6B_jBsFCEVVGCtmBZqOmZPMV-qd8-1R73AAtF7UVV1_LnyZ5v6SSSxhsC",
          scope: "api:direct-access"
        }).toString()
      );
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

//curl 'http://localhost:9004/api/v1/runner/6a1eb759-37a1-4ee5-a097-b54dd1ce3dd0/runProject' -H 'Authorization: Bearer ci' -H 'Content-Type: application/json' --data-raw '{"env":[{"key":"RELEASE_VERSION","value":"227"},{"key":"API_URL","value":"https://enrich-data-portal-dev.nonprod.dna.rr-it.com"},{"key":"JWT_TOKEN","value":"eyJraWQiOiIyNnFhcnpqSVlUal9YdXVPSlh5VzhWemZrdkFPbkVjN3lkUlNPaUlKM0hZIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjhTZl96NGJjcVJfd1cweEZBdTBiWC1mV3VSNjg4bU91a1Q2M2lVRW94SWMiLCJpc3MiOiJodHRwczovL2ViYXRlcy5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3Mjc4MDIwNzcsImV4cCI6MTcyNzgwNTY3NywiY2lkIjoiMG9hMXQ1dzUxeXRsTkI3ME4waDgiLCJzY3AiOlsiYXBpOmRpcmVjdC1hY2Nlc3MiXSwic3ViIjoiMG9hMXQ1dzUxeXRsTkI3ME4waDgifQ.O7kAEM9hDDKjNwDWvsg32QtHBUCxjEahosxvwZlw7jIiOMNapnFOyGKRfEkgLVOrUfvut3HcScSmyZoNnG0n5lVnvvxpNsJ1SSoGyGVNbgxh-jX9OXcvDcrUDFG0awik3F-RIA-Y20hG69XkVN0v-wARnxLCcN7b6rzTWPBRPP5GzefC9BntY5ZnNI9_Hp2wUrd90JFqqwiZPCoEP2OHVAwDTUX-ohVwodALrV3QbPnTUHAi7iIiGJsUvH8yCaOulHKhrrX1zWu6l4t7VSgxpMxKMQ1qg-c0l98LrS3WJ68tlLDEuiZNX77jQZ5q_zpAH3ZXDEwJbPwdxvUCPlZXrg"}]}'
function triggerAutomation(token) {
  return new Promise((resolve, reject) => {
    try {
      if (!token) reject("Ivalid Token");

      const options = {
        hostname: "leap.dataplatform-np.rr-it.com",
        //hostname: "localhost",
        //port: 9004,
        path: "/api/v1/runner/6a1eb759-37a1-4ee5-a097-b54dd1ce3dd0/runProject",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ci"
        }
      };
      const req = http.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          const body = Buffer.concat(chunks);
          resolve(JSON.parse(body.toString()));
        });
      });

      req.write(
        JSON.stringify({
          env: [
            { key: "RELEASE_VERSION", value: "219" },
            { key: "API_URL", value: "https://enrich-data-portal-dev.nonprod.dna.rr-it.com" },
            { key: "API_PREVIEW_URL", value: "https://enrich-data-portal-preview.prod.dna.rr-it.com" },
            { key: "JWT_TOKEN", value: token },
            { key: "TEAM_NAME", value: "admin" }
          ]
        })
      );
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

generateAccessToken()
  .then((generated) => {
    if (generated?.access_token) {
      triggerAutomation(generated?.access_token)
        .then((response) => {
          console.log(response);
        })
        .catch((e) => {
          console.error("Failed to Trigger Test Automation", e);
        });
    } else {
      console.error("LEAP: Invalid Token");
    }
  })
  .catch((e) => {
    console.error("Failed to Generate Access Token for Test Automation", e);
  });
