const { E_NODE_STATE } = require("engine_utils");

const Task = require("./task");

class StopTask extends Task {
    constructor(info) {
        super(info);
    }

    async run() {
        super.run();
        if (this._data.notify) {
            this.setStatus(E_NODE_STATE.COMPLETED, 100, this._data.channel);
        } else {
            this.setStatus(E_NODE_STATE.COMPLETED);
        }
    }
}

module.exports = StopTask;
