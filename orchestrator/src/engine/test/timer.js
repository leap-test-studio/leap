const timer = 5001;
let elapsed = 0;
const next = () => {
  const progress = Math.round((elapsed / timer) * 100);
  if (progress >= 100) {
    //done
    //this.changeJobState(job, JobStatus.COMPLETED);
    return;
  }
  elapsed += 500;
  console.log(elapsed, timer, progress);
  setTimeout(next, 500);
};

const { merge } = require("lodash");

const settings = {
  key: ["val1"]
};

merge(settings, {
  test: "e",
  key: ["val2"]
});
merge(settings, null);

console.log(settings);
