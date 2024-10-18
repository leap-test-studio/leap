const { JOB_TYPES, JOB_STATUS } = require("../../constants");

class JobNode {
  #id;
  #incomming;
  #outgoing;
  #tasks;
  #type;
  #status;
  #children;

  constructor(data = {}) {
    this.#id = data.id;
    this.#incomming = data.incomming || [];
    this.#outgoing = data.outgoing || [];
    this.#tasks = data.tasks || [];
    this.#type = data.type;
    this.#status = JOB_STATUS.READY;
    this.#children = data.children || [];
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
      status: this.#status,
      children: this.#children.map((c) => c.toJson())
    };
  }

  toString() {
    return JSON.stringify(this.#toJson());
  }
}

function traverse(root, id) {
  const currentNode = root.nodes.find((n) => n.id === id);
  if (currentNode == null) return;
  const tasks = [];

  const targetNodes = root.edges
    .filter((edge) => edge.source == id)
    .map((e) => {
      return traverse(root, e.target);
    });

  if (currentNode.type == JOB_TYPES.CASE_TASK) {
    tasks.push(currentNode.data);
  } else if (currentNode.type == JOB_TYPES.TIMER_TASK) {
    tasks.push({ ...currentNode.data, timer: currentNode.data.timer || 5000 });
  } else if (currentNode.type == JOB_TYPES.SCENARIO_TASK) {
    currentNode.data.TestCases?.forEach((tc) => {
      tasks.push(tc);
    });
  }

  return new JobNode({
    id,
    incomming: root.edges.filter((e) => e.target === id).map((e) => e.source),
    outgoing: root.edges.filter((e) => e.source === id).map((e) => e.target),
    jobId: currentNode.data.id || id,
    type: currentNode.type,
    tasks,
    children: targetNodes
  });
}

module.exports = (obj) => traverse(obj, "start");
