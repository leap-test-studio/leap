// action - state management
import * as actionTypes from "../actions";

const initialState = {
  testplans: [],
  listLoading: false,
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  details: null,
  isFirstTestPlan: false,
  accountData: null,
  plan: {}
};

const TestPlanReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TEST_PLAN_LIST: {
      return {
        ...state,
        listLoading: false,
        isFirstTestPlan: Array.isArray(payload?.items) && payload.items.length === 0,
        testplans: payload?.items || []
      };
    }
    case actionTypes.GET_TEST_PLAN:
    case actionTypes.UPDATE_TEST_PLAN:
    case actionTypes.RESET_TEST_PLAN:
    case actionTypes.CREATE_TEST_PLAN:
    case actionTypes.DELETE_TEST_PLAN: {
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

export default TestPlanReducer;
