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

export const fetchTestCaseList = (pid, sid) => (dispatch) => {
  axios.get(`/api/v1/project/${pid}/scenario/${sid}/testcases`).then((res) => {
    dispatch({
      type: actionTypes.GET_TESTCASE_LIST,
      payload: res?.data
    });
  });
};

export const createTestCase = (pid, sid, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${pid}/scenario/${sid}/testcase`, data)
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

export const cloneTestCase = (pid, sid, id) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/project/${pid}/scenario/${sid}/testcase/${id}/clone`)
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

export const runTestCases = (pid, payload) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .post(`/api/v1/runner/${pid}/runTestCases`, payload)
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

export const updateTestCase = (pid, sid, tid, data) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .put(`/api/v1/project/${pid}/scenario/${sid}/testcase/${tid}`, data)
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

export const deleteTestCase = (pid, sid, tid) => (dispatch) => {
  resetTestCaseFlags({ loading: true });
  axios
    .delete(`/api/v1/project/${pid}/scenario/${sid}/testcase/${tid}`)
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

export const fetchTestCase = (pid, sid, tid) => (dispatch) => {
  dispatch({
    type: actionTypes.GET_TESTCASE,
    payload: {
      case: null
    }
  });
  axios
    .get(`/api/v1/project/${pid}/scenario/${sid}/testcase/${tid}`)
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
