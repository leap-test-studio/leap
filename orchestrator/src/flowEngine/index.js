const Runtime = require("./runtime");
const uuid = require("uuid");

class FlowEngine {
  constructor({ flow, context = {} }) {
    this._instanceId = uuid.v4();
    this._flow = flow;
    this._context = context;
    this._runtime = new Runtime({ instanceId: this._instanceId, flow: this._flow, context: this._context });
  }

  start() {
    this._runtime.start();
    return this._runtime;
  }
}

module.exports = FlowEngine;
