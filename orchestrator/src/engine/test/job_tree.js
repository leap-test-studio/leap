const { JOB_STATUS } = require("../../constants");

class JobNode {
  #id;
  #incomming;
  #outgoing;
  #tasks;
  #type;
  #status;

  constructor(data = {}) {
    this.#id = data.id;
    this.#incomming = data.incomming || [];
    this.#outgoing = data.outgoing || [];
    this.#tasks = data.tasks || [];
    this.#type = data.type;
    this.#status = JOB_STATUS.READY;
  }

  getId() {
    return this.#id;
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

  getTasks() {
    return this.#tasks;
  }

  getStatus() {
    return this.#status;
  }

  #toJson() {
    return {
      id: this.#id,
      incomming: this.#incomming,
      outgoing: this.#outgoing,
      tasks: this.#tasks,
      type: this.#type,
      status: this.#status
    };
  }

  toString() {
    return JSON.stringify(this.#toJson());
  }
}

module.exports = JobNode;
