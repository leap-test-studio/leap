const Task = require("../flowEngine/task");

class StartTask extends Task {
    run({ context }) {
        return new Promise((resolve) => {
            setTimeout(() => {
                context.testcases = 0;
                resolve({ done: true, async: true });
            }, 1000);
        });
    }
}

module.exports = StartTask;
