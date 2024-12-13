import axios from "axios";
// action - state management
import * as actionTypes from "../actionsTypes";

export const resetAccountFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_ACCOUNT,
      payload: {
        listLoading: false,
        loading: false,
        message: null,
        showMessage: false,
        ...props
      }
    });
  };

export const fetchAccountList = () => (dispatch) => {
  dispatch(
    resetAccountFlags({
      listLoading: true
    })
  );
  axios
    .get("/api/v1/accounts")
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_ACCOUNT_LIST,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RESET_ACCOUNT,
        payload: {
          listLoading: false
        }
      });
    });
};

export const fetchAccount = (pid) => (dispatch) => {
  axios.get(`/api/v1/accounts/${pid}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_ACCOUNT,
        payload: res.data
      });
  });
};

export const createAccount = (data) => (dispatch) => {
  dispatch(resetAccountFlags());
  axios
    .post("/api/v1/accounts", data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.CREATE_ACCOUNT,
          payload: {
            ...res.data,
            loading: false,
            message: "Account Created Successfully",
            details: `Account ID: ${res.data.id}`,
            showMessage: "success",
            isFirstAccount: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.CREATE_ACCOUNT,
        payload: {
          loading: false,
          message: "Failed to Create Account",
          showMessage: "error",
          details: e.response?.data?.error
        }
      });
    });
};

export const updateAccount = (pid, data) => (dispatch) => {
  dispatch(resetAccountFlags());
  axios
    .put(`/api/v1/accounts/${pid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_ACCOUNT,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Account Updated Successfully",
            details: `Account Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_ACCOUNT,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Update Account",
          details: `Account Id: ${pid}`
        }
      });
    });
};

export const deleteAccount = (pid) => (dispatch) => {
  dispatch(resetAccountFlags());
  axios
    .delete(`/api/v1/accounts/${pid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_ACCOUNT,
          payload: {
            ...res.data,
            message: "Account Deleted Successfully",
            showMessage: "success",
            details: `Account Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_ACCOUNT,
        payload: {
          ...e.response?.data,
          message: "Failed to Delete Account",
          showMessage: "error",
          details: `Account Id: ${pid}`
        }
      });
    });
};
