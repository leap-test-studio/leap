import NodeTypes from "./NodeTypes";

export const RequestSchemas = {
  [NodeTypes.TIMER_NODE]: {
    description:
      "Timer Intermediate Catch Event - Pauses a Sequenceflow thread (of activities) for a specific period of time or until E_INTERMEDIATE_CATCH_EVENT received.",
    properties: {
      timer: {
        default: 30000,
        description: "Sleep interval in Seconds",
        title: "Sleep Interval",
        type: "integer"
      }
    },
    required: ["timer"],
    title: "Timer Event",
    type: "object"
  }
};
export const RequestUISchemas = {
  [NodeTypes.TIMER_NODE]: {
    elements: [
      {
        scope: "#/properties/timer",
        type: "Control",
        options: {
          format: "time"
        }
      }
    ],
    label: "Timer Event",
    type: "CustomGroup"
  }
};
