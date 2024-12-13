const { E_NODE_STATE } = require("engine_utils");
const { EventEmitter } = require("events");

const TestHandler = require("../../test_handler");
const { getSettingsByTestId, updateScreenshot } = require("../../services/job_service");

class Task extends EventEmitter {
    #bid;
    #id;
    #type;
    #status;
    #startTime;
    #endTime;
    #elapsedTime;
    #progress;
    #incomming;
    #outgoing;

    constructor(node) {
        super(node);
        this.#bid = node.bid;
        this.#id = node.id;
        this.#incomming = node.incomming || [];
        this.#outgoing = node.outgoing || [];
        this._data = node.data || {};
        this.#type = node.type;
        this.#status = E_NODE_STATE.READY;
        this.#startTime = 0;
        this.#endTime = this.#startTime;
        this.#elapsedTime = -1;
        this.#progress = 0;
    }

    getBid() {
        return this.#bid;
    }

    getId() {
        return this.#id;
    }

    run() {
        this.#status = E_NODE_STATE.ACTIVE;
        this.#startTime = new Date().getTime();
    }

    stop() {
        this.setStatus(E_NODE_STATE.ABORTED);
    }

    canContinue() {
        return this.#status === E_NODE_STATE.ACTIVE;
    }

    getIncomming() {
        return this.#incomming;
    }

    getOutgoing() {
        return this.#outgoing;
    }

    getType() {
        return this.#type;
    }

    getData() {
        return this._data;
    }

    #publish(channel) {
        this.emit("STATUS", this.#status, channel);
    }

    setStatus(status, progress, channel) {
        this.#status = status;
        if (status === E_NODE_STATE.COMPLETED) this.#progress = 100;
        if (progress > -1) {
            this.#progress = progress;
        }
        logger.info("SetTaskStatus:", this.#id, this.#status, this.#progress);

        switch (status) {
            case E_NODE_STATE.ACTIVE:
                this.#startTime = new Date().getTime();
                break;
            case E_NODE_STATE.ABORTED:
            case E_NODE_STATE.ERRORED:
            case E_NODE_STATE.COMPLETED:
                this.#endTime = new Date().getTime();
                this.#elapsedTime = this.#endTime - this.#startTime;
                break;
        }

        this.#publish(channel);
    }

    setProgress(progress) {
        this.#progress = progress;
        this.#publish();
    }

    getStatus() {
        return this.#status;
    }

    toJson() {
        return {
            id: this.#id,
            type: this.#type,
            status: this.#status,
            startTime: this.#startTime,
            endTime: this.#endTime,
            elapsedTime: this.#elapsedTime,
            progress: this.#progress,
            data: this._data
        };
    }

    toString() {
        return JSON.stringify(this.toJson());
    }

    async executeTestCase(id, data = {}) {
        const BuildMasterId = this.getBid();
        const testcase = await getSettingsByTestId(BuildMasterId, id);
        const jobEntry = new global.DbStoreModel.Job({
            TestCaseId: testcase.id,
            BuildMasterId,
            steps: testcase.execSteps,
            createdAt: Date.now()
        });
        await jobEntry.save();
        const runner = TestHandler.createRunner({
            ...data,
            ...testcase,
            id: jobEntry.id
        });
        runner.on("CAPTURE_SCREENSHOT", async ({ id, result }) => {
            await updateScreenshot(id, result);
        });
        return runner;
    }
}

module.exports = Task;
