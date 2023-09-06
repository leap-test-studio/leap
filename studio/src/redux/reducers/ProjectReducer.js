// action - state management
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
  testscenarios: [],
  testcases: {},
  draggableItems: [],
  settings: {
    nodes: [],
    edges: []
  }
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
      const testscenarios = [];

      const draggableItems = [
        {
          title: "Internal",
          type: "group",
          elements: [
            {
              id: 0,
              type: "element",
              value: "TIMER",
              label: "Timer",
              description: "Delay Node"
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
            type: "SN",
            data: { label: "Start" },
            position: { x: 300, y: 300 }
          }
        ];
      }

      payload.TestScenarios?.forEach((ts) => {
        testscenarios.push(ts);
        const elements = [];
        ts.TestCases?.forEach((tc) => {
          testcases[tc.id] = tc;
          if (tc.enabled) {
            elements.push({
              ...tc,
              type: "element",
              value: tc.id,
              label: tc.label,
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
        ...payload,
        ...state,
        testcases,
        testscenarios,
        projectData: payload,
        draggableItems
      };
    }
    case actionTypes.START_PROJECT_BUILDS:
    case actionTypes.STOP_PROJECT_BUILDS:
    case actionTypes.CREATE_PROJECT:
    case actionTypes.GET_VIEW:
    case actionTypes.DELETE_PROJECT: {
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
