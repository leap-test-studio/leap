class Task {
  constructor({ node, context }) {
    console.log(node, context);
  }

  async run() {
    // To be implemented by the derived class
    console.log("Run");
    return Promise.resolve();
  }
}

module.exports = Task;
