const { EventEmitter } = require("events");

class Task extends EventEmitter {
  constructor(info) {
    this._data = { ...info };
    this._context = {
      testcases: 0
    };
  }

  async run() {
    // To be implemented by the derived class
    console.log("Run", this._node.id);
    return Promise.resolve();
  }
}

module.exports = Task;
