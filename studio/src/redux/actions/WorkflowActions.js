import axios from "axios";
// action - state management
import * as actionTypes from "../actionsTypes";

export const resetWorkflowFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_WF,
      payload: {
        loading: false,
        listLoading: false,
        message: null,
        showMessage: false,
        ...props
      }
    });
  };

export const fetchWorkflowList = (id) => (dispatch) => {
  dispatch(resetWorkflowFlags({ listLoading: true }));
  axios
    .get(`/api/v1/workflow/${id}/list`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_WF_LIST,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RESET_WF,
        payload: {
          listLoading: false
        }
      });
    });
};

export const fetchWorkflow = (tpid) => (dispatch) => {
  axios.get(`/api/v1/workflow/${tpid}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_WF,
        payload: { wf: res.data }
      });
  });
};

export const createWorkflow =
  (ProjectMasterId, { name, description }) =>
  (dispatch) => {
    dispatch(resetWorkflowFlags());
    axios
      .post("/api/v1/workflow", { name, description, ProjectMasterId })
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_WF,
            payload: {
              ...res.data,
              loading: false,
              message: "Workflow Created Successfully",
              details: `Workflow ID: ${res.data.id}`,
              showMessage: "success",
              isFirstWorkflow: false
            }
          });
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.CREATE_WF,
          payload: {
            loading: false,
            message: "Failed to Create Workflow",
            showMessage: "error",
            details: e.response?.data?.error
          }
        });
      });
  };

export const updateWorkflow = (tpid, data) => (dispatch) => {
  dispatch(resetWorkflowFlags());
  axios
    .put(`/api/v1/workflow/${tpid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_WF,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Workflow Updated Successfully",
            details: `Workflow Id: ${tpid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_WF,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Update Workflow",
          details: `Workflow Id: ${tpid}`
        }
      });
    });
};

export const deleteWorkflow = (pid) => (dispatch) => {
  dispatch(resetWorkflowFlags());
  axios
    .delete(`/api/v1/workflow/${pid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_WF,
          payload: {
            ...res.data,
            message: "Workflow Deleted Successfully",
            showMessage: "success",
            details: `Workflow Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_WF,
        payload: {
          ...e.response?.data,
          message: "Failed to Delete Workflow",
          showMessage: "error",
          details: `Workflow Id: ${pid}`
        }
      });
    });
};

export const deleteEdge = (payload) => (dispatch) => {
  dispatch({
    type: actionTypes.TEST_SEQUENCER_DELETE_EDGE,
    payload
  });
};

export const sequenceEvents = (type, opts) => (dispatch) => {
  dispatch({
    type: actionTypes.CONFIG_SIMULATION_BUTTON,
    payload: {
      type,
      opts
    }
  });
};

export const updateSequence = (pid, payload) => (dispatch) => {
  dispatch({
    type: actionTypes.TEST_SEQUENCER,
    payload: {
      savingChanges: true,
      showMessage: false,
      message: null
    }
  });
  axios
    .put(`/api/v1/workflow/${pid}`, payload)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.TEST_SEQUENCER,
          payload: {
            savingChanges: false,
            settings: res.data,
            isError: false,
            message: "Workflow Updated Successfully",
            showMessage: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.TEST_SEQUENCER,
        payload: {
          ...e.response?.data,
          isError: true,
          savingChanges: false,
          message: "Failed to Update Project",
          showMessage: true
        }
      });
    });
};
