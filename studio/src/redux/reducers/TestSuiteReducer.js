// action - state management
import * as actionTypes from "../actions";

const initialState = {
  testsuites: [],
  loading: false,
  showMessage: false,
  isError: false,
  message: null
};

const TestSuiteReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TESTSUITE_LIST: {
      return {
        ...state,
        isFirstTestSuite: Array.isArray(payload.items) && payload.items.length === 0,
        testsuites: payload.items
      };
    }
    case actionTypes.UPDATE_TESTSUITE:
    case actionTypes.CREATE_TESTSUITE:
    case actionTypes.CLONE_TESTSUITE:
    case actionTypes.DELETE_TESTSUITE:
    case actionTypes.RUN_TESTSUITE: {
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

export default TestSuiteReducer;
