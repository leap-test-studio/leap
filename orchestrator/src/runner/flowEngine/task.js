class Task {
  async run(options = {}) {
    // To be implemented by the derived class
    console.log(options);
  }
}

module.exports = Task;
