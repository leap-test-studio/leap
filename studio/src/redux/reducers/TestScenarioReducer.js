// action - state management
import * as actionTypes from "../actions";

const initialState = {
  testscenarios: [],
  loading: false,
  showMessage: false,
  isError: false,
  message: null,
  error: null
};

const TestScenarioReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TEST_SCENARIO_LIST: {
      return {
        ...state,
        isFirstTestScenario: Array.isArray(payload.items) && payload.items.length === 0,
        testscenarios: payload.items
      };
    }
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
