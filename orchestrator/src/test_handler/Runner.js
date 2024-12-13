const { EventEmitter } = require("events");
const isEmpty = require("lodash/isEmpty");
const { E_EXEC_STATE } = require("engine_utils");

const { getLocalTime } = require("../utils");

class Runner extends EventEmitter {
    constructor(o) {
        super();
        this._taskId = o.id;
        this._buildId = o.BuildMasterId;
        this.settings = o.settings;
        this.actual = o.actual || {};
        this.result = o.result;
        this.steps = [];
        this.execSteps = o.execSteps;
        this.type = o.type;
        this._seqNo = o.seqNo;
        this._startTime = getLocalTime();
        this._endTime = null;
        this._skipSteps = false;
        this._interruptTask = false;
        this._extras = {};
    }

    interruptTask() {
        this._skipSteps = true;
        this._interruptTask = true;
    }

    shouldTaskContinue() {
        return !this._interruptTask || !this._skipSteps || this.steps.filter((s) => s.result === E_EXEC_STATE.FAIL).length === 0;
    }

    addStep(step) {
        logger.trace("Adding step:", JSON.stringify(step), " SkipSteps:", this._skipSteps);
        if (step.result === E_EXEC_STATE.FAIL) {
            this._skipSteps = true;
        }
        if (step.result !== E_EXEC_STATE.SKIP) {
            this.steps.push(step);
        }
        this.result = step.result;
        this._endTime = getLocalTime();
    }

    beforeHook() {
        return new Promise((resolve, reject) => {
            logger.info(`TC:${this._taskId} Validate Properties`);
            if (isEmpty(this.execSteps) || this.type === E_EXEC_STATE.DRAFT) {
                logger.error(`TC:${this._taskId} TestCase is invalid`);
                this._notifyJob(E_EXEC_STATE.INVALID_TESTCASE);
                return reject({
                    actual: this.execSteps,
                    steps: [],
                    result: E_EXEC_STATE.INVALID_TESTCASE
                });
            } else {
                this._notifyJob(E_EXEC_STATE.RUNNING);
                return resolve();
            }
        });
    }

    setBuildProperties(key, value) {
        this._extras[key] = value;
    }

    getBuildProperties(key) {
        return this._extras[key];
    }

    async afterHook() {
        const payload = {
            result: this.result,
            actual: this.actual,
            steps: this.steps,
            startTime: this._startTime,
            endTime: this._endTime
        };
        await this._updateJobDetails(this._taskId, payload);
    }

    toString(s) {
        let label = "";
        if (this._buildId) label += `BID:${this._buildId}, `;
        if (this._buildId) label += `JID:${this._taskId}, `;
        return `${label}TCID:${this._seqNo}, Message:${s}`;
    }

    async start() {
        logger.info(this.toString("Execute Before Hook"));
        try {
            await this.beforeHook();
            logger.info(`TC:${this._taskId} TestCase is Valid`);
            await this.before();
            logger.info(this.toString("Execute Test Case"));
            await this.execute();
            logger.info(this.toString("Execute After Hook"));
        } catch (e) {
            logger.error("Execution failed", e);
            this.actual = { error: e.message };
            this.result = E_EXEC_STATE.SKIP;
        }
        try {
            await this.after();
        } catch (e) {
            logger.error("After Hook failed", e);
        }
        try {
            await this.afterHook();
        } catch (e) {
            logger.error("After Hook failed", e);
        }
    }

    async stop() {
        this.interruptTask();
    }

    getStatus() {
        return this.result;
    }

    async _notifyJob(result) {
        this.result = result;
        this._updateJobDetails(this._taskId, { result, extras: this._extras });
    }

    async _updateJobDetails(id, payload) {
        if (this._interruptTask) {
            return;
        }
        this.emit("UPDATE_STATUS", { id, payload });
    }

    before() {
        return Promise.resolve();
    }

    execute() {
        this.actual = { actualResult: "Invalid Test Case" };
        this.result = E_EXEC_STATE.INVALID_TESTCASE;
        return Promise.resolve(true);
    }

    after() {
        return Promise.resolve();
    }

    stop() {}
}

module.exports = Runner;
