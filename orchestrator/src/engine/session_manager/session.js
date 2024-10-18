"use strict";
const EventEmitter = require("events");
const uuid = require("uuid");

const { SessionStates } = require("./status");
const { default: Queue } = require("../../utils/queue");
const JobTreeParser = require("./job_tree");

class Session extends EventEmitter {
  #waitingQueue;
  #runningTasks;
  #executedTasks;
  #jobTree;

  constructor(data) {
    super();
    this.sessionId = uuid.v4();
    this.#waitingQueue = new Queue(); // Push all Paralell tasks
    this.#runningTasks = [];
    this.#executedTasks = [];
    this.status = SessionStates.READY;
    this.createTime = new Date().getTime();
    this.startTime = null;
    this.endTime = null;
    this.#jobTree = JobTreeParser(data);
    this.statusMessage = null;
    this.#registerEvents();
  }

  #registerEvents() {
    this.on("error", (message) => {
      if (!this.startTime) this.startTime = new Date().getTime();
      this.endTime = new Date().getTime();
      this.status = SessionStates.ERROR;
      this.statusMessage = message;
    });
    this.on("log", (message) => {
      console.log(`SessionMan::${this.sessionId} - ${message}`);
    });
    this.on("run", this.#run);
  }

  /**
   * State Machine
   */
  start() {
    try {
      if (this.#jobTree.getTasks().length == 0) {
        this.startTime = new Date().getTime();
        this.endTime = new Date().getTime();
        this.status = SessionStates.ERROR;
        return;
      }
      this.startTime = new Date().getTime();
      this.status = SessionStates.RUNNING;
      this.addJobToWaitingQueue(this.#jobTree.getId());
    } catch (err) {}
  }

  #run() {
    do {
        this.#waitingQueue.push(...this.#jobTree.getTasks());
        
      setInterval(() => this.emit("run"), 5000);
    } while (this.status === SessionStates.RUNNING);
  }

  addJobToWaitingQueue(id) {
    this.emit("log", `JIB:${id} Adding Job to WaitingQueue`);
    this.#waitingQueue.push(id);
  }

  stop() {}

  save() {}
}

module.exports = Session;
