// action - state management
import { NodeTypes } from "../../views/pages/sequencer/Constants";
import * as actionTypes from "../actions";

const initialState = {
  projects: [],
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  isFirstProject: false,
  openedProject: null,
  projectData: null,
  testscenarios: {},
  testcases: {},
  draggableItems: [],
  settings: {
    nodes: [],
    edges: []
  },
  builds: null,
  update_settings_status: null
};

const ProjectReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_PROJECT_LIST: {
      return {
        ...state,
        isFirstProject: Array.isArray(payload.items) && payload.items.length === 0,
        projects: payload.items
      };
    }
    case actionTypes.GET_PROJECT:
    case actionTypes.UPDATE_PROJECT: {
      const testcases = {};
      const testscenarios = {};

      const draggableItems = [
        {
          title: "Internal",
          type: "group",
          elements: [
            {
              id: 0,
              type: NodeTypes.TIMER_TASK,
              value: {
                timer: 0,
                label: "Timer Event"
              },
              icon: "Timer",
              label: "Timer",
              description: "Timer Task"
            }
          ]
        }
      ];

      if (payload.settings) {
        if (payload.settings.nodes) {
          state.settings.nodes = [...payload.settings.nodes];
        }
        if (payload.settings.edges) {
          state.settings.edges = [...payload.settings.edges];
        }
      } else {
        state.settings.nodes = [
          {
            id: "start",
            type: NodeTypes.START_TASK,
            data: { label: "Start" },
            position: { x: 50, y: 300 }
          }
        ];
      }

      payload.TestScenarios?.forEach((ts) => {
        testscenarios[ts.id] = ts;
        const elements = [
          {
            id: ts.id,
            type: NodeTypes.SCENARIO_TASK,
            value: ts,
            label: ts.name,
            icon: "DynamicForm",
            description: ts.description
          }
        ];
        ts.TestCases?.forEach((tc) => {
          testcases[tc.id] = tc;
          if (tc.enabled) {
            elements.push({
              ...tc,
              type: NodeTypes.CASE_TASK,
              value: tc,
              label: tc.label,
              icon: "ElectricBolt",
              description: (
                <div className="grid grid-cols-1 gap-4">
                  <p>
                    <strong>Given:</strong>
                    <br />
                    {tc.given}
                  </p>
                  <p>
                    <strong>When:</strong>
                    <br />
                    {tc.when}
                  </p>
                  <p>
                    <strong>Then:</strong>
                    <br />
                    {tc.then}
                  </p>
                </div>
              )
            });
          }
        });
        if (elements.length > 0)
          draggableItems.push({
            title: `Scenario: ${ts.name}`,
            type: "group",
            elements
          });
      });
      return {
        ...state,
        ...payload,
        testcases,
        testscenarios,
        projectData: payload,
        draggableItems
      };
    }
    case actionTypes.RESET_PROJECT:
    case actionTypes.START_PROJECT_BUILDS:
    case actionTypes.STOP_PROJECT_BUILDS:
    case actionTypes.CREATE_PROJECT:
    case actionTypes.GET_VIEW:
    case actionTypes.DELETE_PROJECT:
    case actionTypes.GET_PROJECT_BUILDS: {
      return {
        ...state,
        ...payload
      };
    }
    default: {
      return {
        ...state
      };
    }
  }
};

export default ProjectReducer;
