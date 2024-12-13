import { FaFlagCheckered, FaInfo, FaTableList } from "react-icons/fa6";
import { RiTimerFlashFill } from "react-icons/ri";
import { MdTableChart } from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import { E_EVENT_TYPE } from "engine_utils";

import { Operators, StatusCodeLabel } from "./Constants";
import TestCaseNode from "./nodes/TestCaseNode";
import StartNode from "./nodes/StartNode";
import TestSuiteNode from "./nodes/TestSuiteNode";
import DefaultEdge from "./edges/DefaultEdge";
import StopNode from "./nodes/StopNode";
import BaseNode from "./nodes/BaseNode";

const conditionSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      isActive: {
        type: "boolean",
        default: true
      },
      statement: {
        type: "array",
        items: {
          type: "object",
          properties: {
            operator: {
              type: "string",
              default: "eq",
              oneOf: Object.keys(Operators).map((key) => ({ const: key, title: Operators[key] }))
            },
            rightOp: {
              type: "number",
              default: 2,
              oneOf: Object.keys(StatusCodeLabel).map((key) => ({ const: key, title: StatusCodeLabel[key] }))
            }
          }
        }
      },
      fallback: {
        type: "string"
      }
    }
  }
};

const conditionUiSchema = {
  scope: "#/properties/conditions",
  type: "Control",
  options: {
    rowTitle: "Condition",
    disableExpand: true,
    detail: {
      type: "VerticalLayout",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            {
              type: "Control",
              scope: "#/properties/isActive",
              label: "Enabled?"
            },
            {
              type: "Control",
              scope: "#/properties/fallback",
              label: "Next Node"
            }
          ]
        },
        {
          type: "Control",
          scope: "#/properties/statement",
          options: {
            rowTitle: "Expression",
            disableExpand: true,
            detail: {
              type: "HorizontalLayout",
              elements: [
                {
                  type: "Control",
                  scope: "#/properties/operator",
                  label: "Operator"
                },
                {
                  type: "Control",
                  scope: "#/properties/rightOp",
                  label: "Status Code"
                }
              ]
            }
          }
        }
      ]
    }
  }
};

const labelSchema = {
  type: "object",
  properties: {
    label: {
      title: "Label",
      type: "string",
      minLength: 1,
      maxLength: 30
    }
  }
};

const labelUiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      scope: "#/properties/label",
      type: "Control"
    }
  ]
};

const testCaseSchema = {
  type: "object",
  properties: {
    testCase: {
      title: "Test Case",
      type: "string"
    }
  },
  required: ["testCase"]
};

const testCaseUiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      scope: "#/properties/testCase",
      type: "Control"
    }
  ]
};

const testSuiteSchema = {
  type: "object",
  properties: {
    testSuite: {
      title: "Test Suite",
      type: "string"
    }
  },
  required: ["testSuite"]
};

const testSuiteUiSchema = {
  type: "VerticalLayout",
  elements: [
    {
      scope: "#/properties/testSuite",
      type: "Control"
    }
  ]
};

export const RequestSchemas = {
  [E_EVENT_TYPE.START_EVENT]: {
    type: "object",
    properties: {
      env: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          }
        }
      }
    }
  },
  [E_EVENT_TYPE.STOP_EVENT]: {
    type: "object",
    properties: {
      notify: { type: "boolean" },
      channel: { type: "string" }
    }
  },
  [E_EVENT_TYPE.TIMER_EVENT]: {
    description:
      "Timer Intermediate Catch Event - Pauses a Sequenceflow thread (of activities) for a specific period of time or until E_INTERMEDIATE_CATCH_EVENT received.",
    properties: {
      timer: {
        default: 30,
        description: "Sleep interval in Seconds",
        title: "Sleep Interval",
        type: "integer"
      }
    },
    required: ["timer"],
    title: "Timer Event",
    type: "object"
  },
  [E_EVENT_TYPE.TEST_CASE_EVENT]: testCaseSchema,
  [E_EVENT_TYPE.TEST_SUITE_EVENT]: testSuiteSchema,
  labelSchema
};

export const RequestUISchemas = {
  [E_EVENT_TYPE.START_EVENT]: {
    type: "Control",
    scope: "#/properties/env",
    label: "Environmental Variables",
    options: {
      disableExpand: true,
      rowTitle: "",
      detail: {
        type: "HorizontalLayout",
        elements: [
          { type: "Control", scope: "#/properties/key" },
          { type: "Control", scope: "#/properties/value" }
        ]
      }
    }
  },
  [E_EVENT_TYPE.STOP_EVENT]: {
    type: "VerticalLayout",
    elements: [
      {
        label: "Notify status over slack channel?",
        scope: "#/properties/notify",
        type: "Control",
        options: {
          toggle: true
        }
      },
      {
        label: "Slack channel ID",
        scope: "#/properties/channel",
        type: "Control",
        rule: {
          effect: "SHOW",
          condition: {
            type: "LEAF",
            scope: "#/properties/notify",
            expectedValue: true
          }
        }
      }
    ]
  },
  [E_EVENT_TYPE.TIMER_EVENT]: {
    type: "VerticalLayout",
    elements: [
      {
        scope: "#/properties/timer",
        type: "Control"
      }
    ]
  },
  [E_EVENT_TYPE.TEST_CASE_EVENT]: testCaseUiSchema,
  [E_EVENT_TYPE.TEST_SUITE_EVENT]: testSuiteUiSchema,
  labelUiSchema
};

export const nodeTypes = Object.freeze({
  [E_EVENT_TYPE.START_EVENT]: StartNode,
  [E_EVENT_TYPE.TEST_CASE_EVENT]: TestCaseNode,
  [E_EVENT_TYPE.TEST_SUITE_EVENT]: TestSuiteNode,
  [E_EVENT_TYPE.TIMER_EVENT]: BaseNode,
  [E_EVENT_TYPE.STOP_EVENT]: StopNode,
  default: TestCaseNode
});

export const getNodeIcon = (type, size = 12) => {
  switch (type) {
    case E_EVENT_TYPE.START_EVENT:
      return <IoFlash size={size} />;
    case E_EVENT_TYPE.TIMER_EVENT:
      return <RiTimerFlashFill size={size} />;
    case E_EVENT_TYPE.TEST_CASE_EVENT:
      return <FaTableList size={size} />;
    case E_EVENT_TYPE.TEST_SUITE_EVENT:
      return <MdTableChart size={size} />;
    case E_EVENT_TYPE.STOP_EVENT:
      return <FaFlagCheckered size={size} />;
  }
  return <FaInfo size={size} />;
};

export const edgeTypes = Object.freeze({ default: DefaultEdge });

export const draggableItems = [
  {
    id: 0,
    type: E_EVENT_TYPE.TIMER_EVENT,
    value: {
      timer: 30
    },
    icon: <RiTimerFlashFill />,
    label: "Timer Event"
  },
  {
    id: 1,
    type: E_EVENT_TYPE.TEST_CASE_EVENT,
    value: {},
    icon: <FaTableList />,
    label: "Test Case"
  },
  {
    id: 2,
    type: E_EVENT_TYPE.TEST_SUITE_EVENT,
    value: {},
    icon: <MdTableChart />,
    label: "Test Suite"
  }
];
