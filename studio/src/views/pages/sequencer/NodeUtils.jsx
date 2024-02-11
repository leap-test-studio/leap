import { NodeTypes, Operators, StatusCodeLabel } from "./Constants";

const conditionsSchema = {
  type: "object",
  title: "Output Evaluation",
  properties: {
    conditions: {
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
    }
  }
};

const conditionsUiSchema = {
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

export const RequestSchemas = {
  [NodeTypes.TIMER_TASK]: {
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
  },
  [NodeTypes.CASE_TASK]: conditionsSchema,
  [NodeTypes.SCENARIO_TASK]: conditionsSchema
};
export const RequestUISchemas = {
  [NodeTypes.TIMER_TASK]: {
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
  },
  [NodeTypes.CASE_TASK]: conditionsUiSchema,
  [NodeTypes.SCENARIO_TASK]: conditionsUiSchema
};
