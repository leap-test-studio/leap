import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestCaseFlags = () => (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_TESTCASE,
    payload: {
      isTestCaseCreated: false,
      isTestCaseCreateFailed: false,
      isTestCaseDeleted: false,
      isTestCaseDeleteFailed: false,
      isTestCaseUpdated: false,
      isTestCaseUpdatedError: false,
      isTestCaseCloned: false,
      isTestCaseCloneFailed: false
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
  dispatch({
    type: actionTypes.CREATE_TESTCASE,
    payload: {
      loading: true,
      isTestCaseCreated: false,
      isTestCaseCreateFailed: false
    }
  });
  axios
    .post(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_TESTCASE,
          payload: {
            ...res.data,
            isTestCaseCreated: true,
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
          isTestCaseCreateFailed: true,
          loading: false
        }
      });
    });
};

export const cloneTestCase = (projectId, testSuiteId, id) => (dispatch) => {
  dispatch({
    type: actionTypes.CLONE_TESTCASE,
    payload: {
      loading: true,
      isTestCaseCloned: false,
      isTestCaseCloneFailed: false
    }
  });
  axios
    .post(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${id}/clone`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CLONE_TESTCASE,
          payload: {
            ...res.data,
            isTestCaseCloned: true,
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
          isTestCaseCloneFailed: true,
          loading: false
        }
      });
    });
};

export const runTestCase = (projectId, testSuiteId, id) => (dispatch) => {
  axios
    .post(
      `/api/v1/runner/test/${id}`,
      {
        projectId,
        testSuiteId
      },
      {}
    )
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.RUN_TESTCASE,
          payload: {
            ...res.data
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RUN_TESTCASE,
        payload: {
          ...e.response.data
        }
      });
    });
};

export const updateTestCase = (projectId, testSuiteId, testCaseId, data) => (dispatch) => {
  dispatch({
    type: actionTypes.UPDATE_TESTCASE,
    payload: {
      isTestCaseUpdated: false,
      isTestCaseUpdatedFailed: false
    }
  });
  axios
    .put(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testCaseId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TESTCASE,
          payload: {
            ...res.data,
            showMessage: true,
            isTestCaseUpdated: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TESTCASE,
        payload: {
          ...e.response.data,
          isTestCaseUpdatedFailed: true
        }
      });
    });
};

export const deleteTestCase = (projectId, testSuiteId, testCaseId) => (dispatch) => {
  dispatch({
    type: actionTypes.DELETE_TESTCASE,
    payload: {
      isTestCaseDeleted: false,
      isTestCaseDeleteFailed: false
    }
  });
  axios
    .delete(`/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testCaseId}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TESTCASE,
          payload: {
            ...res.data,
            isTestCaseDeleted: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TESTCASE,
        payload: {
          ...e.response.data,
          isTestCaseDeleteFailed: true
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
