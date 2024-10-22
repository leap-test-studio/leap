const data = require("./data.json");
const { JOB_STATUS, JOB_TYPES } = require("../../constants");

class JobNode {
  #id;
  #incomming;
  #outgoing;
  #data;
  #type;
  #status;

  constructor(node = {}) {
    this.#id = node.id;
    this.#incomming = node.incomming || [];
    this.#outgoing = node.outgoing || [];
    this.#data = node.data || {};
    this.#type = node.type;
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

  getData() {
    return this.#data;
  }

  getStatus() {
    return this.#status;
  }

  #toJson() {
    return {
      id: this.#id,
      incomming: this.#incomming,
      outgoing: this.#outgoing,
      data: this.#data,
      type: this.#type,
      status: this.#status
    };
  }

  toString() {
    return JSON.stringify(this.#toJson());
  }
}

class Graph {
  #nodes;
  #edges;
  #jobNodes;

  constructor({ nodes, edges }) {
    this.#nodes = nodes || [];
    this.#edges = edges || [];
    this.#jobNodes = new Map();
    this.#nodes.forEach((n) => {
      let data = {};
      if (n.type == JOB_TYPES.CASE_TASK || n.type == JOB_TYPES.SCENARIO_TASK) {
        data.id = n.data.id;
      } else if (n.type == JOB_TYPES.TIMER_TASK) {
        data = { ...n.data, timer: n.data.timer || 5000 };
      }
      this.#jobNodes.set(
        n.id,
        new JobNode({
          ...n,
          incomming: this.#edges.filter((e) => e.target === n.id).map((e) => e.source),
          outgoing: this.#edges.filter((e) => e.source === n.id).map((e) => e.target),
          jobId: n.data.id || n.id
        })
      );
    });
  }

  getNodes(id) {
    const currentNode = this.#jobNodes.get(id);
    if (currentNode) {
      return currentNode.getOutgoing().map((id) => this.#jobNodes.get(id));
    }
    return [];
  }
}

const g = new Graph(data);
console.log(g.getNodes("twZpYF-jiG"));
