const { EventEmitter } = require("events");

class Task extends EventEmitter {
  constructor(info) {
    this._data = { ...info };
    this._context = {
      testcases: 0
    };
  }
}

module.exports = Task;
