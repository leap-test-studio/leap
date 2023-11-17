const { FlowEngine } = require("./flowEngine");

const TestcaseTask = require("./taskHandlers/testcaseTask");
const TestscenarioTask = require("./taskHandlers/testscenarioTask");
const TimerTask = require("./taskHandlers/timerTask");
const StartTask = require("./taskHandlers/startTask");

exports.executeSequence = function ({ settings, ...context }) {
  return new Promise((resolve) => {
    const flowEngine = new FlowEngine({
      flow: settings,
      context,
      tasks: { SN: new StartTask(), TC: new TestcaseTask(), TS: new TestscenarioTask(), TIMER: new TimerTask() }
    });

    const runtime = flowEngine.run();
    runtime.on("end", () => {
      console.log(context);
      resolve(context);
    });
  });
};
