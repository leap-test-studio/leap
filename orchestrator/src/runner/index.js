const { FlowEngine } = require("./flowEngine");

exports.executeSequence = function ({ settings, ...context }) {
  return new Promise((resolve) => {
    const flowEngine = new FlowEngine({
      flow: settings,
      context
    });

    const runtime = flowEngine.run();
    runtime.on("end", () => {
      console.log(context);
      resolve(context);
    });
  });
};
