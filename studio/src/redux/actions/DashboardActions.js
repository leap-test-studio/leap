import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

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
  axios.get("/api/v1/dashboard/build/recent").then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_RECENT_BUILD_SUMMARY,
        payload: res.data
      });
  });
};

export const getTotalStats = () => (dispatch) => {
  axios.get("/api/v1/dashboard/build/total").then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TOTAL_STATS,
        payload: res.data
      });
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
