import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

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

export const updateSequence = (projectId, settings) => (dispatch) => {
  dispatch({
    type: actionTypes.TEST_SEQUENCER,
    payload: {
      showMessage: false,
      message: null
    }
  });
  axios
    .put(`/api/v1/project/${projectId}`, {
      settings
    })
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.TEST_SEQUENCER,
          payload: {
            settings: res.data,
            isError: false,
            message: "Project Updated Successfully",
            showMessage: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.TEST_SEQUENCER,
        payload: {
          ...e.response.data,
          isError: true,
          message: "Failed to Update Project",
          showMessage: true
        }
      });
    });
};
