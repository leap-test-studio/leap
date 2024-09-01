import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTestPlanFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_TEST_PLAN,
      payload: {
        loading: false,
        message: null,
        showMessage: false,
        ...props
      }
    });
  };

export const fetchTestPlanList = (id) => (dispatch) => {
  axios.get(`/api/v1/test-plan/${id}/list`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TEST_PLAN_LIST,
        payload: res.data
      });
  });
};

export const fetchTestPlan = (tpid) => (dispatch) => {
  axios.get(`/api/v1/test-plan/${tpid}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TEST_PLAN,
        payload: { plan: res.data }
      });
  });
};

export const createTestPlan =
  (ProjectMasterId, { name, description }) =>
  (dispatch) => {
    dispatch(resetTestPlanFlags());
    axios
      .post("/api/v1/test-plan", { name, description, ProjectMasterId })
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_TEST_PLAN,
            payload: {
              ...res.data,
              loading: false,
              message: "Test Plan Created Successfully",
              details: `Test Plan ID: ${res.data.id}`,
              showMessage: "success",
              isFirstTestPlan: false
            }
          });
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.CREATE_TEST_PLAN,
          payload: {
            loading: false,
            message: "Failed to Create Test Plan",
            showMessage: "error",
            details: e.response.data.error
          }
        });
      });
  };

export const updateTestPlan = (tpid, data) => (dispatch) => {
  dispatch(resetTestPlanFlags());
  axios
    .put(`/api/v1/test-plan/${tpid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TEST_PLAN,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Test Plan Updated Successfully",
            details: `Test Plan Id: ${tpid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TEST_PLAN,
        payload: {
          ...e.response.data,
          showMessage: "error",
          message: "Failed to Update Test Plan",
          details: `Test Plan Id: ${tpid}`
        }
      });
    });
};

export const deleteTestPlan = (pid) => (dispatch) => {
  dispatch(resetTestPlanFlags());
  axios
    .delete(`/api/v1/test-plan/${pid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TEST_PLAN,
          payload: {
            ...res.data,
            message: "Test Plan Deleted Successfully",
            showMessage: "success",
            details: `Test Plan Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TEST_PLAN,
        payload: {
          ...e.response.data,
          message: "Failed to Delete Test Plan",
          showMessage: "error",
          details: `Test Plan Id: ${pid}`
        }
      });
    });
};
