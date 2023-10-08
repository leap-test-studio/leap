const Task = require("../flowEngine/task");

class TestscenarioTask extends Task {
    run({ node, context }) {
        console.log(Date.now(), new Date(), "TS", node?.id);
        return new Promise((resolve) => {
            setTimeout(() => {
                context.testcases += 1;
                resolve({ done: true, async: true });
            }, 100);
        });
    }
}

module.exports = TestscenarioTask;
