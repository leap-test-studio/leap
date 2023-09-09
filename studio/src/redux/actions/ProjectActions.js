import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetProjectFlags = () => (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_PROJECT,
    payload: {
      isError: false,
      showMessage: false,
      message: null
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
    dispatch({
      type: actionTypes.CREATE_PROJECT,
      payload: {
        loading: true,
        showMessage: false,
        message: null
      }
    });
    axios
      .post("/api/v1/project", { name, description })
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_PROJECT,
            payload: {
              ...res.data,
              isError: false,
              message: "Project created successfully",
              showMessage: true,
              loading: false,
              isFirstProject: false
            }
          });
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.CREATE_PROJECT,
          payload: {
            ...e.response.data,
            isError: true,
            message: "Failed to Create Project",
            showMessage: true,
            loading: false
          }
        });
      });
  };

export const updateProject = (projectId, data) => (dispatch) => {
  dispatch({
    type: actionTypes.UPDATE_PROJECT,
    payload: {
      showMessage: false,
      message: null
    }
  });
  axios
    .put(`/api/v1/project/${projectId}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_PROJECT,
          payload: {
            ...res.data,
            isError: false,
            message: "Project Updated Successfully",
            showMessage: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_PROJECT,
        payload: {
          ...e.response.data,
          isError: true,
          message: "Failed to Update Project",
          showMessage: true
        }
      });
    });
};

export const deleteProject = (project) => (dispatch) => {
  dispatch({
    type: actionTypes.DELETE_PROJECT,
    payload: {
      showMessage: false,
      message: null
    }
  });
  axios
    .delete(`/api/v1/project/${project}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_PROJECT,
          payload: {
            ...res.data,
            isError: false,
            message: "Project Deleted Successfully",
            showMessage: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_PROJECT,
        payload: {
          ...e.response.data,
          isError: true,
          message: "Failed to Delete Project",
          showMessage: true
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
            installing: false,
            isProjectUpdated: true
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

export const stopProjectBuilds = (project) => (dispatch) => {
  dispatch({
    type: actionTypes.STOP_PROJECT_BUILDS,
    payload: {
      stopping: true
    }
  });
  axios
    .post(`/api/v1/runner/${project}/stop`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.STOP_PROJECT_BUILDS,
          payload: {
            ...res.data,
            stopping: false,
            isProjectUpdated: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.STOP_PROJECT_BUILDS,
        payload: {
          ...e.response.data,
          stopping: false
        }
      });
    });
};
