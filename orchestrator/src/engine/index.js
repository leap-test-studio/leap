const { EventEmitter } = require("events");
const uuid = require("uuid");
const { E_NODE_STATE, E_EVENT_TYPE, E_EXEC_STATE, E_STATIC_ID, E_SSE } = require("engine_utils");

const TaskFactory = require("./task_factory");
const { getBuildInfo } = require("../services/job_service");
const { DirectedAcyclicGraph } = require("./dag");
const SSEChannel = require("../_helpers/sse");
const { sendSlackNotification } = require("../_helpers/slack");

class FlowEngine extends EventEmitter {
    #id;
    #wf;
    #flow;
    #jobNodes;
    #status;
    #startTime;
    #endTime;
    #elapsedTime;

    constructor(wf) {
        super();
        this.#id = uuid.v4();
        this.#wf = wf;
        this.#jobNodes = new Map();
        this.#status = E_EXEC_STATE.DRAFT;
        this.#flow = new DirectedAcyclicGraph((n) => n.getId());
        this.#wf.nodes.forEach((n) => {
            let data = {
                id: ""
            };
            n.status = E_NODE_STATE.READY;
            n.progress = 0;
            if (n.type == E_EVENT_TYPE.TEST_CASE_EVENT || n.type == E_EVENT_TYPE.TEST_SUITE_EVENT) {
                data.id = n.data.id;
            } else if (n.type == E_EVENT_TYPE.TIMER_EVENT) {
                data = { ...n.data, timer: n.data.timer || 5000 };
            }
            const node = TaskFactory.createNew({
                ...n,
                incomming: this.#wf.edges.filter((e) => e.target === n.id).map((e) => e.source),
                outgoing: this.#wf.edges.filter((e) => e.source === n.id).map((e) => e.target),
                id: n.data.id || n.id,
                bid: this.#wf.bid
            });
            this.#flow.insert(node);
            if (n.id === E_STATIC_ID.START || node.getIncomming().length >= 1) this.#jobNodes.set(n.id, node);
        });
        this.#wf.edges.forEach(({ source, target }) => {
            this.#flow.addEdge(source, target);
        });
        Array.from(this.#jobNodes.keys()).forEach((id) => {
            if (![E_STATIC_ID.START, E_STATIC_ID.STOP].includes(id) && !this.#flow.canReachFrom(E_STATIC_ID.START, id)) {
                this.#jobNodes.delete(id);
            }
        });
        this.#elapsedTime = -1;
    }

    #getSummary() {
        let passed = 0,
            failed = 0,
            skipped = 0,
            running = 0;
        this.#jobNodes.forEach((j) => {
            const index = this.#wf.nodes.findIndex((n) => n.id === j.getId());
            if (index > -1) {
                const data = j.toJson();
                Object.keys(data).forEach((key) => {
                    this.#wf.nodes[index][key] = data[key];
                });
            }
            switch (j.getStatus()) {
                case E_NODE_STATE.ABORTED:
                case E_NODE_STATE.SKIPPED:
                case E_NODE_STATE.INACTIVE:
                    skipped++;
                    break;
                case E_NODE_STATE.ERRORED:
                    failed++;
                    break;
                case E_NODE_STATE.COMPLETED:
                    passed++;
                    break;
                case E_NODE_STATE.ACTIVE:
                    running++;
                    break;
            }
        });

        if (this.#jobNodes.size === passed + failed + skipped) {
            this.#endTime = Date.now();
            if (this.#jobNodes.size === passed) {
                this.#status = E_EXEC_STATE.PASS;
            } else if (failed > 0) {
                this.#status = E_EXEC_STATE.FAIL;
            }
        }
        return {
            total: this.#jobNodes.size,
            passed,
            failed,
            skipped,
            running,
            status: this.#status,
            startTime: this.#startTime,
            endTime: this.#endTime
        };
    }

    async #updateBuildSummary() {
        let passed = 0,
            failed = 0,
            skipped = 0,
            running = 0;
        this.#jobNodes.forEach((j) => {
            const index = this.#wf.nodes.findIndex((n) => n.id === j.getId());
            if (index > -1) {
                const data = j.toJson();
                Object.keys(data).forEach((key) => {
                    this.#wf.nodes[index][key] = data[key];
                });
            }
            switch (j.getStatus()) {
                case E_NODE_STATE.ABORTED:
                case E_NODE_STATE.SKIPPED:
                case E_NODE_STATE.INACTIVE:
                    skipped++;
                    break;
                case E_NODE_STATE.ERRORED:
                    failed++;
                    break;
                case E_NODE_STATE.COMPLETED:
                    passed++;
                    break;
                case E_NODE_STATE.ACTIVE:
                    running++;
                    break;
            }
        });

        if (this.#jobNodes.size === passed + failed + skipped) {
            this.#endTime = Date.now();
            if (this.#jobNodes.size === passed) {
                this.#status = E_EXEC_STATE.PASS;
            } else if (failed > 0) {
                this.#status = E_EXEC_STATE.FAIL;
            }
        }

        const summary = this.#getSummary();

        SSEChannel.publish(E_SSE.WF_STATUS, {
            ...this.#wf,
            ...summary
        });
        const build = await getBuildInfo(this.#wf.bid);
        Object.assign(build, {
            flow: this.#wf,
            ...summary
        });
        build.changed("updatedAt", true);
        build.updatedAt = Date.now();
        return await build.save();
    }

    start() {
        if (this.#status === E_EXEC_STATE.RUNNING) {
            return Promise.reject("Already running, REF:" + this.#id);
        }
        this.#startTime = Date.now();
        this.setStatus(E_EXEC_STATE.RUNNING);
        this.runJob(E_STATIC_ID.START);
    }

    stop() {
        this.setStatus(E_EXEC_STATE.ABORT);
        this.#jobNodes.forEach((j) => {
            j.stop();
        });
    }

    getStatus() {
        const obj = {
            id: this.#id,
            jobs: Array.from(this.#jobNodes.values()).map((j) => j.toJson()),
            status: this.#status
        };
        if (this.#startTime) {
            obj.startTime = this.#startTime;
        }
        if (this.#endTime) {
            obj.endTime = this.#endTime;
        }
        if (this.#elapsedTime && this.#elapsedTime > -1) {
            obj.elapsedTime = this.#elapsedTime;
        }
        return obj;
    }

    setStatus(status) {
        this.#status = status;
        this.#updateBuildSummary();
    }

    isJobReadyToRun(id) {
        const job = this.#getJob(id);
        let statuses = [];
        job.getIncomming().forEach((j) => {
            const predecessor = this.#getJob(j);
            statuses.push(predecessor.getStatus());
        });
        return statuses.filter((s) => s !== E_NODE_STATE.COMPLETED).length === 0;
    }

    waitUntilPredecessorsComplete(id) {
        const job = this.#getJob(id);
        if (id == E_STATIC_ID.START || job.getOutgoing().length === 0) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const next = () => {
                if (this.isJobReadyToRun(id)) {
                    resolve(true);
                } else {
                    setTimeout(next, 500);
                }
            };
            next();
        });
    }

    #canExecute() {
        return ![E_NODE_STATE.ABORTED, E_NODE_STATE.ERRORED, E_NODE_STATE.SKIPPED].includes(this.#status);
    }

    async #executeJob(id) {
        if (!this.#canExecute()) {
            return;
        }
        await this.waitUntilPredecessorsComplete(id);
        await this.#triggerJob(id);
        await this.#updateBuildSummary();
    }

    #triggerJob(id) {
        return new Promise(async (resolve) => {
            const job = this.#jobNodes.get(id);

            try {
                job.run();
                job.on("STATUS", async (status, channel) => {
                    logger.info(status, channel);
                    if (channel) {
                        await sendSlackNotification(channel, JSON.stringify(this.#getSummary()));
                    }
                    if (![E_NODE_STATE.ACTIVE, E_NODE_STATE.READY].includes(status)) {
                        return resolve(job);
                    }
                    this.#updateBuildSummary();
                });
            } catch (error) {
                logger.error(error);
                job.setStatus(E_NODE_STATE.ERRORED);
                return resolve(job);
            }
        });
    }

    #getJob(id) {
        return this.#jobNodes.get(id);
    }

    #isJobActive(id) {
        return this.#jobNodes.get(id).getStatus() === E_NODE_STATE.ACTIVE;
    }

    async #findNextJobs(id) {
        const nextJobs = this.#jobNodes.get(id).getOutgoing();
        const nextJobsAsync = [];
        nextJobs.forEach((j) => {
            nextJobsAsync.push(this.runJob(j));
        });
        await Promise.all(nextJobsAsync);
    }

    async runJob(id) {
        if (this.#isJobActive(id)) {
            return Promise.resolve();
        }
        await this.#executeJob(id);
        await this.#findNextJobs(id);

        if (id === E_STATIC_ID.START) {
            this.#endTime = new Date().getTime();
            this.#elapsedTime = this.#endTime - this.#startTime;
            if (!this.#canExecute()) {
                this.#status = E_NODE_STATE.COMPLETED;
            }
        }
        return Promise.resolve();
    }
}

module.exports = FlowEngine;
