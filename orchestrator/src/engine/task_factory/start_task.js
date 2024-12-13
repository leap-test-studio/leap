const { E_NODE_STATE } = require("engine_utils");
const Task = require("./task");
const { sleep } = require("../utils");

class StartTask extends Task {
    constructor(info) {
        super(info);
    }

    async run() {
        super.run();
        this.setStatus(E_NODE_STATE.ACTIVE, 50);
        await sleep(5000);
        this.setStatus(E_NODE_STATE.COMPLETED);
    }
}

module.exports = StartTask;
