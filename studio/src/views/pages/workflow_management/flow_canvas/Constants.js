import { E_EXEC_STATE, E_NODE_STATE } from "engine_utils";

const capitalize = require("lodash/capitalize");

let props = {};
Object.keys(E_EXEC_STATE)
  .filter((key) => !["DRAFT", "RUNNING"].includes(key))
  .forEach((key) => {
    let value = E_EXEC_STATE[key];
    if (!isNaN(value)) {
      props[value] = capitalize(key);
    }
  });

export const StatusCodeLabel = Object.freeze({
  ...props
});

export const Operators = Object.freeze({
  eq: "Equals",
  ne: "Not Equals"
});

export const IconColors = Object.freeze({
  [E_NODE_STATE.ERRORED]: "text-red-600",
  [E_NODE_STATE.READY]: "text-color-0600",
  [E_NODE_STATE.INACTIVE]: "text-red-600 animate-pulse",
  [E_NODE_STATE.ACTIVE]: "text-green-600",
  [E_NODE_STATE.COMPLETED]: "text-green-600"
});

export const IconTypes = Object.freeze({
  [E_NODE_STATE.READY]: "HourglassTop",
  [E_NODE_STATE.ERRORED]: "Error",
  [E_NODE_STATE.COMPLETED]: "CheckCircle",
  [E_NODE_STATE.INACTIVE]: "FiberSmartRecord",
  [E_NODE_STATE.ACTIVE]: "NotificationsActive",
  [E_NODE_STATE.ABORTED]: "ReportProblem"
});
