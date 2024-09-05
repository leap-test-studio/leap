const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
const bluebird = require("bluebird");

const TaskHandler = require("./src/task_handler");

const filename = process.argv[3];
const ProjectMaster = JSON.parse(fs.readFileSync(path.resolve(filename)));
if (!ProjectMaster.status) {
  console.log(`Project:'${ProjectMaster.name}' is disabled`);
  process.exit(1);
}

const Jobs = [];
const BuildMasterId = uuid.v4();
global.config = {};

ProjectMaster.TestScenarios?.forEach((suite) => {
  if (suite.status) {
    suite.TestCases.forEach((tc) => {
      Jobs.push({
        ...tc,
        BuildMasterId,
        projectId: ProjectMaster.id
      });
    });
  }
});

bluebird
  .reduce(
    Jobs,
    async (acc, job) => {
      const runner = TaskHandler.createHandler(job);

      runner.on("UPDATE_STATUS", async ({ id, payload }) => {
        try {
          logger.info(runner.toString("Uploading Job details: " + JSON.stringify(payload)));
        } catch (error) {
          logger.error("Failed to Update", error);
        }
      });
      return acc + 1;
    },
    0
  )
  .then((acc) => {
    console.log("Accumulator:", acc);
  })
  .catch(console.error);
