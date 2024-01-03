class TestRunner extends Job {
  constructor(job) {
    super(job);
  }

  async before() {
    return Promise.resolve();
  }
  async execute() {
    return Promise.resolve();
  }
  async after() {
    return Promise.resolve();
  }

  async stop() {}
}

module.exports = TestRunner;
