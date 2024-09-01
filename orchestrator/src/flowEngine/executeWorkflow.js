const fs = require("fs");
const { WorkflowState } = require("./models");

// Load the workflow JSON
const workflow = JSON.parse(fs.readFileSync("workflow.json", "utf8"));

// Define tasks
const tasks = {
  task1: (callback) => {
    console.log("Executing Task 1");
    setTimeout(() => {
      const result = Math.random(); // Random condition
      console.log(`Task 1 result: ${result}`);
      callback(null, result);
    }, 1000);
  },
  task2: (callback) => {
    console.log("Executing Task 2");
    setTimeout(() => {
      console.log("Task 2 completed");
      callback(null, "Task 2 result");
    }, 1000);
  },
  task3: (callback) => {
    console.log("Executing Task 3");
    setTimeout(() => {
      console.log("Task 3 completed");
      callback(null, "Task 3 result");
    }, 1000);
  },
  task4: (callback) => {
    console.log("Executing Task 4");
    setTimeout(() => {
      console.log("Task 4 completed");
      callback(null, "Task 4 result");
    }, 1000);
  }
};

// Function to save the task state to the database
const saveTaskState = async (taskName, result, status) => {
  try {
    await WorkflowState.create({
      taskName,
      result: JSON.stringify(result),
      status
    });
  } catch (err) {
    console.error("Error saving task state:", err);
  }
};

// Function to get the last executed task from the database
const getLastExecutedTask = async () => {
  try {
    return await WorkflowState.findOne({
      order: [["createdAt", "DESC"]]
    });
  } catch (err) {
    console.error("Error retrieving last executed task:", err);
  }
};

// Execute the workflow
const executeTask = async (taskName, previousResult) => {
  const task = workflow.tasks[taskName];
  if (!task) {
    throw new Error(`Task ${taskName} not found`);
  }

  tasks[taskName](async (err, result) => {
    if (err) {
      await saveTaskState(taskName, result, "failed");
      throw err;
    } else {
      await saveTaskState(taskName, result, "completed");

      if (task.next) {
        if (typeof task.next === "string") {
          await executeTask(task.next, result);
        } else if (typeof task.next === "object") {
          const condition = new Function("result", `return ${task.next.condition};`);
          const nextTask = condition(result) ? task.next.true : task.next.false;
          await executeTask(nextTask, result);
        }
      }
    }
  });
};

// Start the workflow
(async () => {
  try {
    const lastTask = await getLastExecutedTask();
    const startTask = lastTask ? lastTask.taskName : workflow.start;
    const previousResult = lastTask ? JSON.parse(lastTask.result) : null;

    await executeTask(startTask, previousResult);
    console.log("Workflow completed successfully");
  } catch (err) {
    console.error("Error executing workflow:", err);
  }
})();
