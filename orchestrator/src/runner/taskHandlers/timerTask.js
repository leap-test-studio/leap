const Task = require("../flowEngine/task");

class TimerTask extends Task {
    run({ node }) {
        console.log(Date.now(), new Date(), "TIMER", node?.id);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ done: true, async: true });
            }, node?.data?.timer);
        });
    }
}

module.exports = TimerTask;
