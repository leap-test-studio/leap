// action - state management
import * as actionTypes from "../actionsTypes";

const initialState = {
  totalItems: 0,
  testsuites: [],
  testcases: {},
  listLoading: false,
  loading: false,
  showMessage: false,
  isError: false,
  message: null,
  error: null
};

const TestScenarioReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TEST_SCENARIO_LIST: {
      state.testcases = {};

      payload?.items?.forEach((t) => {
        t.TestCases?.forEach((t) => {
          state.testcases[t.id] = t;
        });
      });

      return {
        ...state,
        listLoading: false,
        isFirstTestScenario: payload.totalItems === 0,
        totalItems: payload.totalItems,
        testsuites: payload.items
      };
    }
    case actionTypes.RESET_TEST_SCENARIO:
    case actionTypes.UPDATE_TEST_SCENARIO:
    case actionTypes.CREATE_TEST_SCENARIO:
    case actionTypes.CLONE_TEST_SCENARIO:
    case actionTypes.DELETE_TEST_SCENARIO:
    case actionTypes.RUN_TEST_SCENARIO: {
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

export default TestScenarioReducer;
