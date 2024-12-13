import { E_EVENT_TYPE } from "engine_utils";

import * as actionTypes from "../actionsTypes";

const initialState = {
  totalItems: 0,
  projects: [],
  listLoading: false,
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  details: null,
  isFirstProject: false,
  openedProject: null,
  projectData: null,
  testsuites: {},
  testcases: {},
  builds: null
};

const ProjectReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_PROJECT_LIST: {
      return {
        ...state,
        listLoading: false,
        isFirstProject: payload.totalItems === 0,
        totalItems: payload.totalItems,
        projects: payload?.items || []
      };
    }
    case actionTypes.GET_PROJECT:
    case actionTypes.UPDATE_PROJECT: {
      const testcases = {};
      const testsuites = {};

      payload &&
        payload.TestScenarios?.forEach((ts) => {
          testsuites[ts.id] = ts;
          const elements = [
            {
              id: ts.id,
              type: E_EVENT_TYPE.TEST_SUITE_EVENT,
              value: ts,
              label: ts.name,
              icon: "NextWeekRounded",
              description: ts.description
            }
          ];
          ts.TestCases?.forEach((tc) => {
            testcases[tc.id] = tc;
            if (tc.enabled) {
              elements.push({
                ...tc,
                type: E_EVENT_TYPE.TEST_CASE_EVENT,
                value: tc,
                label: tc.label,
                icon: (
                  <img
                    src={`/assets/img/${tc.type === 2 ? "chrome-logo.svg" : "rest-api-icon.svg"}`}
                    alt={tc.label}
                    width={30}
                    height={30}
                    style={{ margin: "5px" }}
                  />
                ),
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
        });
      return {
        ...state,
        ...payload,
        testcases,
        testsuites,
        projectData: payload
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
