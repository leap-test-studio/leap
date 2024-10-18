import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetTenantFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_TENANT,
      payload: {
        listLoading: false,
        loading: false,
        message: null,
        showMessage: false,
        ...props
      }
    });
  };

export const fetchTenantList = () => (dispatch) => {
  dispatch(
    resetTenantFlags({
      listLoading: true
    })
  );
  axios
    .get("/api/v1/tenants")
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_TENANT_LIST,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RESET_TENANT,
        payload: {
          listLoading: false
        }
      });
    });
};

export const fetchTenant = (tid) => (dispatch) => {
  axios.get(`/api/v1/tenants/${tid}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_TENANT,
        payload: res.data
      });
  });
};

export const createTenant =
  ({ name, description }) =>
  (dispatch) => {
    dispatch(resetTenantFlags());
    axios
      .post("/api/v1/tenants", { name, description })
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_TENANT,
            payload: {
              ...res.data,
              loading: false,
              message: "Tenant Created Successfully",
              details: `Tenant ID: ${res.data.id}`,
              showMessage: "success",
              isFirstTenant: false
            }
          });
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.CREATE_TENANT,
          payload: {
            loading: false,
            message: "Failed to Create Tenant",
            showMessage: "error",
            details: e.response?.data?.error
          }
        });
      });
  };

export const updateTenant = (tid, data) => (dispatch) => {
  dispatch(resetTenantFlags());
  axios
    .put(`/api/v1/tenants/${tid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_TENANT,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Tenant Updated Successfully",
            details: `Tenant Id: ${tid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_TENANT,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Update Tenant",
          details: `Tenant Id: ${tid}`
        }
      });
    });
};

export const deleteTenant = (tid) => (dispatch) => {
  dispatch(resetTenantFlags());
  axios
    .delete(`/api/v1/tenants/${tid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_TENANT,
          payload: {
            ...res.data,
            message: "Tenant Deleted Successfully",
            showMessage: "success",
            details: `Tenant Id: ${tid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_TENANT,
        payload: {
          ...e.response?.data,
          message: "Failed to Delete Tenant",
          showMessage: "error",
          details: `Tenant Id: ${tid}`
        }
      });
    });
};
