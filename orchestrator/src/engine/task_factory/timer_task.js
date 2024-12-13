const Task = require("./task");
const { E_NODE_STATE } = require("engine_utils");

class TimerTask extends Task {
    #timer;
    #timeLeft;
    #interval;

    constructor(info) {
        super(info);
        this.#timer = 0;
        this.#timeLeft = 0;
        this.#timer = +this._data.timer;
        this.#timeLeft = +this._data.timer;
    }

    tick() {
        if (!this.canContinue()) {
            clearInterval(this.#interval);
            return;
        }
        this.#timeLeft = this.#timeLeft - 1;
        if (this.#timeLeft <= 0) {
            clearInterval(this.#interval);
            this.setStatus(E_NODE_STATE.COMPLETED);
            return;
        }
        this.setStatus(E_NODE_STATE.ACTIVE, Number((1 - this.#timeLeft / this.#timer) * 100).toFixed(2));
    }

    run() {
        super.run();
        this.#interval = setInterval(this.tick.bind(this), 1000);
    }
}

module.exports = TimerTask;
