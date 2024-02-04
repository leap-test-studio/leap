const { EventEmitter } = require("events");

class Task extends EventEmitter {
  constructor({ instanceId, id, type, data }) {
    super();
    this._instanceId = instanceId;
    this._id = id;
    this._type = type;
    this._data = { ...data };
    this._context = {
      testcases: 0
    };
  }
}

module.exports = Task;
