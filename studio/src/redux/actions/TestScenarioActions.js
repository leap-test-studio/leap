import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestScenarioFlags = (options) => (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_TEST_SCENARIO,
    payload: {
      loading: false,
      isError: false,
      showMessage: false,
      message: null,
      error: null,
      ...options
    }
  });
};

export const fetchTestScenarioList = (projectId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}/scenario`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TEST_SCENARIO_LIST,
        payload: res.data
      });
  });
};

export const createTestScenario = (projectId, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/scenario`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false,
            isFirstTestScenario: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CREATE_TEST_SCENARIO,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const updateTestScenario = (projectId, scenarioId, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .put(`/api/v1/project/${projectId}/scenario/${scenarioId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TEST_SCENARIO,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const deleteTestScenario = (projectId, scenarioId) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${projectId}/scenario/${scenarioId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TEST_SCENARIO,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const cloneTestScenario = (projectId, scenarioId, data) => (dispatch) => {
  resetTestScenarioFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/scenario/${scenarioId}/clone`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false,
            isFirstTestScenario: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CLONE_TEST_SCENARIO,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const runTestScenario = (projectId, scenarioId) => (dispatch) => {
  axios
    .post(`/api/v1/runner/${projectId}/runTestScenario/${scenarioId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.RUN_TEST_SCENARIO,
          payload: {
            ...res.data,
            showMessage: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TEST_SCENARIO,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true
        }
      });
    });
};
