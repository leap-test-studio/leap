import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestCaseFlags =
  (options = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_TESTCASE,
      payload: {
        loading: false,
        message: null,
        showMessage: false,
        details: false,
        ...options
      }
    });
  };

export const fetchTestCaseList = (projectId, scenarioId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase`).then((res) => {
    dispatch({
      type: actionTypes.GET_TESTCASE_LIST,
      payload: res.data
    });
  });
};

export const createTestCase = (projectId, scenarioId, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: "success",
            loading: false,
            isFirstTestCase: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CREATE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: "error",
          loading: false,
          details: e.response.data.error
        }
      });
    });
};

export const cloneTestCase = (projectId, scenarioId, id) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase/${id}/clone`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: "success",
            loading: false,
            isFirstTestCase: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CLONE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: "error",
          loading: false,
          details: e.response.data.error
        }
      });
    });
};

export const runTestCases = (projectId, payload) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/runner/${projectId}/runTestCases`, payload)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.RUN_TESTCASE,
          payload: {
            ...res.data,
            showMessage: "success",
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: "error",
          details: e.response.data.error,
          loading: false
        }
      });
    });
};

export const updateTestCase = (projectId, scenarioId, testCaseId, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .put(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase/${testCaseId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: "success",
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: "error",
          details: e.response.data.error,
          loading: false
        }
      });
    });
};

export const deleteTestCase = (projectId, scenarioId, testCaseId) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase/${testCaseId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: "success",
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: "error",
          details: e.response.data.error,
          loading: false
        }
      });
    });
};

export const fetchTestCase = (projectId, scenarioId, testCaseId) => (dispatch) => {
  dispatch({
    type: actionTypes.GET_TESTCASE,
    payload: {
      case: null
    }
  });
  axios
    .get(`/api/v1/project/${projectId}/scenario/${scenarioId}/testcase/${testCaseId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_TESTCASE,
          payload: {
            case: res.data
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.GET_TESTCASE,
        payload: {
          ...e.response.data,
          case: null
        }
      });
    });
};
