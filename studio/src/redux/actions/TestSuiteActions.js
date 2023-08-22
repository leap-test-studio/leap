import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestSuiteFlags = (options) => (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_TESTSUITE,
    payload: {
      loading: false,
      isError: false,
      showMessage: false,
      message: null,
      ...options
    }
  });
};

export const fetchTestSuiteList = (projectId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}/suite`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TESTSUITE_LIST,
        payload: res.data
      });
  });
};

export const createTestSuite = (projectId, data) => (dispatch) => {
  resetTestSuiteFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/suite`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TESTSUITE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false,
            isFirstTestSuite: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CREATE_TESTSUITE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const updateTestSuite = (projectId, testSuiteId, data) => (dispatch) => {
  resetTestSuiteFlags({ loading: true });
  axios
    .put(`/api/v1/project/${projectId}/suite/${testSuiteId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TESTSUITE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TESTSUITE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const deleteTestSuite = (projectId, testSuiteId) => (dispatch) => {
  resetTestSuiteFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${projectId}/suite/${testSuiteId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TESTSUITE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TESTSUITE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const cloneTestSuite = (projectId, suiteId, data) => (dispatch) => {
  resetTestSuiteFlags({ loading: true });
  axios
    .post(`/api/v1/project/${projectId}/suite/${suiteId}/clone`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TESTSUITE,
          payload: {
            ...res.data,
            showMessage: true,
            loading: false,
            isFirstTestSuite: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CLONE_TESTSUITE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true,
          loading: false
        }
      });
    });
};

export const runTestSuite = (projectId, suiteId) => (dispatch) => {
  axios
    .post(`/api/v1/runner/${projectId}/runTestSuite/${suiteId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.RUN_TESTSUITE,
          payload: {
            ...res.data,
            showMessage: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TESTSUITE,
        payload: {
          ...e.response.data,
          showMessage: true,
          isError: true
        }
      });
    });
};
