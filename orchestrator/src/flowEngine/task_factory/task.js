const { EventEmitter } = require("events");

class Task extends EventEmitter {
  constructor({ id, type, data }) {
    super();
    this._id = id;
    this._type = type;
    this._data = { ...data };
    this._context = {
      testcases: 0
    };
  }
}

module.exports = Task;
