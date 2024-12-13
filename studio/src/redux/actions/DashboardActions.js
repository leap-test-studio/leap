import axios from "axios";
// action - state management
import * as actionTypes from "../actionsTypes";

export const resetDashboardFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_DASHBOARD,
      payload: {
        listLoading: false,
        ...props
      }
    });
  };

export const getBuildReports = (projectId) => (dispatch) => {
  axios.get(`/api/v1/dashboard/build/reports/${projectId}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_BUILD_REPORTS,
        payload: res.data
      });
  });
};

export const getBuildDetails = (projectId, buildNo) => (dispatch) => {
  axios.get(`/api/v1/dashboard/build/details/${projectId}/bno/${buildNo}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_BUILD_DETAILS,
        payload: res.data
      });
  });
};

export const getRecentBuildSummary = () => (dispatch) => {
  dispatch(
    resetDashboardFlags({
      listLoading: true
    })
  );
  axios
    .get("/api/v1/dashboard/build/recent")
    .then((res) => {
      dispatch(resetDashboardFlags());
      if (Array.isArray(res?.data))
        dispatch({
          type: actionTypes.GET_RECENT_BUILD_SUMMARY,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch(resetDashboardFlags());
    });
};

export const getTotalStats = () => (dispatch) => {
  dispatch(
    resetDashboardFlags({
      listLoading: true
    })
  );
  axios
    .get("/api/v1/dashboard/build/total")
    .then((res) => {
      dispatch(resetDashboardFlags());
      if (res?.data)
        dispatch({
          type: actionTypes.GET_TOTAL_STATS,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch(resetDashboardFlags());
    });
};

export const getBuildTrend = (projectId) => (dispatch) => {
  axios.get(`/api/v1/dashboard/build/trend/${projectId}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_BUILD_TREND,
        payload: res.data
      });
  });
};
