import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetProjectFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_PROJECT,
      payload: {
        loading: false,
        message: null,
        showMessage: false,
        ...props
      }
    });
  };

export const openProject = (openedProject) => (dispatch) => {
  dispatch({
    type: actionTypes.GET_VIEW,
    payload: {
      openedProject
    }
  });
};

export const fetchProjectList = () => (dispatch) => {
  axios.get("/api/v1/project").then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_PROJECT_LIST,
        payload: res.data
      });
  });
};

export const fetchProject = (projectId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_PROJECT,
        payload: res.data
      });
  });
};

export const fetchProjectBuilds = (projectId) => (dispatch) => {
  axios.get(`/api/v1/project/${projectId}/builds`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_PROJECT_BUILDS,
        payload: {
          builds: res.data
        }
      });
  });
};

export const createProject =
  ({ name, description }) =>
  (dispatch) => {
    dispatch(resetProjectFlags());
    axios
      .post("/api/v1/project", { name, description })
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_PROJECT,
            payload: {
              ...res.data,
              loading: false,
              message: "Project Created Successfully",
              showMessage: "success",
              isFirstProject: false
            }
          });
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.CREATE_PROJECT,
          payload: {
            loading: false,
            message: "Failed to Create Project",
            showMessage: "error",
            details: e.response.data.error
          }
        });
      });
  };

export const updateProject = (projectId, data) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .put(`/api/v1/project/${projectId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_PROJECT,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Project Updated Successfully",
            details: `Project Id: ${projectId}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_PROJECT,
        payload: {
          ...e.response.data,
          showMessage: "error",
          message: "Failed to Update Project",
          details: `Project Id: ${projectId}`
        }
      });
    });
};

export const deleteProject = (project) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .delete(`/api/v1/project/${project}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_PROJECT,
          payload: {
            ...res.data,
            message: "Project Deleted Successfully",
            showMessage: "success",
            details: `Project Id: ${project}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_PROJECT,
        payload: {
          ...e.response.data,
          message: "Failed to Delete Project",
          showMessage: "error",
          details: `Project Id: ${project}`
        }
      });
    });
};

export const triggerSequence = (project) => (dispatch) => {
  dispatch({
    type: actionTypes.START_PROJECT_BUILDS,
    payload: {
      installing: true
    }
  });
  axios
    .post(`/api/v1/runner/${project}/trigger-sequence`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.START_PROJECT_BUILDS,
          payload: {
            ...res.data,
            installing: false
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.START_PROJECT_BUILDS,
        payload: {
          ...e.response.data,
          installing: false
        }
      });
    });
};

export const startProjectBuilds = (project) => (dispatch) => {
  dispatch({
    type: actionTypes.START_PROJECT_BUILDS,
    payload: {
      installing: true
    }
  });
  axios
    .post(`/api/v1/runner/${project}/runProject`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.START_PROJECT_BUILDS,
          payload: {
            ...res.data,
            showMessage: "success",
            details: `Project Id: ${project}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.START_PROJECT_BUILDS,
        payload: {
          ...e.response.data,
          showMessage: "error",
          message: "Failed to Start Project Execution"
        }
      });
    });
};

export const stopProjectBuilds = (project) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .post(`/api/v1/runner/${project}/stop`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.STOP_PROJECT_BUILDS,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Project Execution Stopped Successfully",
            details: `Project Id: ${project}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.STOP_PROJECT_BUILDS,
        payload: {
          ...e.response.data,
          showMessage: "error",
          message: "Failed to Stop Project Execution",
          details: `Project Id: ${project}`
        }
      });
    });
};
