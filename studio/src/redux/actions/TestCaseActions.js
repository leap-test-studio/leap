import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestCaseFlags = (options) => (dispatch) => {
  dispatch({
    type: actionTypes.RESET_TESTCASE,
    payload: {
      loading: false,
      isError: false,
      showMessage: false,
      message: null,
      ...options
    }
  });
};

export const fetchTestCaseList = (projectId, testSuiteId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase`).then((res) => {
    dispatch({
      type: actionTypes.GET_TESTCASE_LIST,
      payload: res.data
    });
  });
};

export const createTestCase = (projectId, testSuiteId, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: true,
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
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const cloneTestCase = (projectId, testSuiteId, id) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${id}/clone`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: true,
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
          showMessage: true,
          isError: true,
          loading: false
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
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const updateTestCase = (projectId, testSuiteId, testCaseId, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .put(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testCaseId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const deleteTestCase = (projectId, testSuiteId, testCaseId) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testCaseId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TESTCASE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const fetchTestCase = (projectId, testSuiteId, testCaseId) => (dispatch) => {
  dispatch({
    type: actionTypes.GET_TESTCASE,
    payload: {
      case: null
    }
  });
  axios
    .get(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testCaseId}`)
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
