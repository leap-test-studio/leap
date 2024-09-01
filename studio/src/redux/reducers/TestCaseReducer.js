// action - state management
import * as actionTypes from "../actions";

const initialState = {
  testcases: [],
  totalItems: 0,
  loading: false,
  case: null,
  isTestCaseCreated: false,
  isTestCaseCreateFailed: false,
  isTestCaseDeleted: false,
  isTestCaseDeleteFailed: false,
  isTestCaseUpdated: false,
  isTestCaseUpdatedFailed: false,
  isTestCaseCloned: false,
  isTestCaseCloneFailed: false,
  isFirstTestCase: false,
  message: ""
};

const TestCaseReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TESTCASE_LIST: {
      return {
        ...state,
        loading: false,
        isFirstTestCase: payload.totalItems === 0,
        testcases: payload.items,
        totalItems: payload.totalItems
      };
    }
    case actionTypes.RESET_TESTCASE:
    case actionTypes.UPDATE_TESTCASE:
    case actionTypes.CREATE_TESTCASE:
    case actionTypes.CLONE_TESTCASE:
    case actionTypes.RUN_TESTCASE:
    case actionTypes.DELETE_TESTCASE: {
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

export default TestCaseReducer;
