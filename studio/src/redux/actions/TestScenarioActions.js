import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestScenarioFlags = (options) => (dispatch) => {
  dispatch({
    type: actionTypes.RESET_TEST_SCENARIO,
    payload: {
      listLoading: false,
      loading: false,
      isError: false,
      showMessage: false,
      message: null,
      error: null,
      ...options
    }
  });
};

export const fetchTestScenarioList = (pid) => (dispatch) => {
  resetTestScenarioFlags({ listLoading: true });
  axios
    .get(`/api/v1/project/${pid}/suite`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_TEST_SCENARIO_LIST,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RESET_TEST_SCENARIO,
        payload: {
          listLoading: false
        }
      });
    });
};

export const createTestScenario = (pid, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .post(`/api/v1/project/${pid}/suite`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Scenario Created Successfully",
            details: `Scenario Id: ${res.data.id}`,
            isFirstTestScenario: false,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CREATE_TEST_SCENARIO,
        payload: {
          ...e.response?.data,
          message: "Failed to Create Scenario",
          showMessage: "error",
          details: e.response?.data?.error,
          loading: false
        }
      });
    });
};

export const updateTestScenario = (pid, sid, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .put(`/api/v1/project/${pid}/suite/${sid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Scenario Updated Successfully",
            details: `Scenario Id: ${sid}`,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TEST_SCENARIO,
        payload: {
          ...e.response?.data,
          message: "Failed to Update Scenario",
          showMessage: "error",
          details: e.response?.data?.error,
          loading: false
        }
      });
    });
};

export const deleteTestScenario = (pid, sid) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${pid}/suite/${sid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Scenario Deleted Successfully",
            details: `Scenario Id: ${sid}`,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TEST_SCENARIO,
        payload: {
          ...e.response?.data,
          message: "Failed to Delete Scenario",
          showMessage: "error",
          details: e.response?.data?.error,
          loading: false
        }
      });
    });
};

export const cloneTestScenario = (pid, sid, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .post(`/api/v1/project/${pid}/suite/${sid}/clone`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Scenario Cloned Successfully",
            details: `Scenario Id: ${res.data.id}`,
            isFirstTestScenario: false,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CLONE_TEST_SCENARIO,
        payload: {
          ...e.response?.data,
          message: "Failed to Clone Scenario",
          showMessage: "error",
          details: e.response?.data?.error,
          loading: false
        }
      });
    });
};

export const runTestScenario = (pid, sid) => (dispatch) => {
  axios
    .post(`/api/v1/runner/${pid}/runTestScenario/${sid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.RUN_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: "success",
            details: `Scenario Id: ${sid}`,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TEST_SCENARIO,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          details: e.response?.data?.error,
          loading: false
        }
      });
    });
};
