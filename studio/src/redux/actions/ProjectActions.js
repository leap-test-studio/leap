import axios from "axios";
// action - state management
import * as actionTypes from "../actions";

export const resetProjectFlags = () => (dispatch) => {
  dispatch({
    type: actionTypes.CREATE_PROJECT,
    payload: {
      isProjectCreated: false,
      isProjectCreateFailed: false,
      isProjectDeleted: false,
      isProjectDeleteFailed: false,
      isProjectUpdated: false,
      isProjectUpdateFailed: false
    }
  });
};

export const fetchProjectList = () => (dispatch) => {
  axios.get("/api/v1/project", {}).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_PROJECT_LIST,
        payload: res.data
      });
  });
};

export const createProject =
  ({ name, description = "" }) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.CREATE_PROJECT,
      payload: {
        loading: true,
        isProjectCreated: false,
        isProjectCreateFailed: false
      }
    });
    axios
      .post("/api/v1/project", { name, description }, {})
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CREATE_PROJECT,
            payload: {
              ...res.data,
              isProjectCreated: true,
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
            isProjectCreateFailed: true,
            loading: false
          }
        });
      });
  };

export const updateProject = (projectId, data) => (dispatch) => {
  dispatch({
    type: actionTypes.UPDATE_PROJECT,
    payload: {
      isProjectUpdated: false,
      isProjectUpdateFailed: false
    }
  });
  axios
    .put(`/api/v1/project/${projectId}`, data, {})
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_PROJECT,
          payload: {
            ...res.data,
            isProjectUpdated: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_PROJECT,
        payload: {
          ...e.response.data,
          isProjectUpdateFailed: true
        }
      });
    });
};

export const deleteProject = (project) => (dispatch) => {
  dispatch({
    type: actionTypes.DELETE_PROJECT,
    payload: {
      isProjectDeleted: false,
      isProjectDeleteFailed: false
    }
  });
  axios
    .delete("/api/v1/project/" + project, {}, {})
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_PROJECT,
          payload: {
            ...res.data,
            isProjectDeleted: true
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_PROJECT,
        payload: {
          ...e.response.data,
          isProjectDeleteFailed: true
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
    .post("/api/v1/runner/" + project + "/start", {})
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
    .post("/api/v1/runner/" + project + "/stop", {})
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
