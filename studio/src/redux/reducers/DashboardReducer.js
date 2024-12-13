// action - state management
import * as actionTypes from "../actionsTypes";

const initialState = {
  recentBuildSummary: [],
  buildReports: [],
  buildDetails: {},
  buildStats: {},
  totalStats: {
    projects: 0,
    suites: 0,
    cases: 0,
    builds: 0
  }
};

const DashboardReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_RECENT_BUILD_SUMMARY: {
      return {
        ...state,
        recentBuildSummary: payload
      };
    }
    case actionTypes.GET_BUILD_REPORTS: {
      return {
        ...state,
        buildReports: payload?.reverse()
      };
    }
    case actionTypes.GET_BUILD_DETAILS: {
      return {
        ...state,
        buildDetails: payload
      };
    }
    case actionTypes.GET_TOTAL_STATS: {
      return {
        ...state,
        totalStats: payload
      };
    }
    case actionTypes.GET_BUILD_TREND: {
      return {
        ...state,
        buildStats: payload
      };
    }
    case actionTypes.RESET_DASHBOARD: {
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

export default DashboardReducer;
