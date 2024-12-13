import axios from "axios";
// action - state management
import * as actionTypes from "../actionsTypes";

export const resetProjectFlags =
  (props = {}) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.RESET_PROJECT,
      payload: {
        listLoading: false,
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
  dispatch(
    resetProjectFlags({
      listLoading: true
    })
  );
  axios
    .get("/api/v1/project")
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.GET_PROJECT_LIST,
          payload: res.data
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.RESET_PROJECT,
        payload: {
          listLoading: false
        }
      });
    });
};

export const fetchProject = (pid) => (dispatch) => {
  axios.get(`/api/v1/project/${pid}`).then((res) => {
    if (res?.data)
      dispatch({
        type: actionTypes.GET_PROJECT,
        payload: res.data
      });
  });
};

export const fetchProjectBuilds = (pid) => (dispatch) => {
  axios.get(`/api/v1/project/${pid}/builds`).then((res) => {
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
              details: `Project ID: ${res.data.id}`,
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
            details: e.response?.data?.error
          }
        });
      });
  };

export const updateProject = (pid, data) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .put(`/api/v1/project/${pid}`, data)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.UPDATE_PROJECT,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Project Updated Successfully",
            details: `Project Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.UPDATE_PROJECT,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Update Project",
          details: `Project Id: ${pid}`
        }
      });
    });
};

export const deleteProject = (pid) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .delete(`/api/v1/project/${pid}`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.DELETE_PROJECT,
          payload: {
            ...res.data,
            message: "Project Deleted Successfully",
            showMessage: "success",
            details: `Project Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.DELETE_PROJECT,
        payload: {
          ...e.response?.data,
          message: "Failed to Delete Project",
          showMessage: "error",
          details: `Project Id: ${pid}`
        }
      });
    });
};

export const triggerSequence = (pid) => (dispatch) => {
  dispatch({
    type: actionTypes.START_PROJECT_BUILDS,
    payload: {
      installing: true
    }
  });
  axios
    .post(`/api/v1/workflow/${pid}/trigger`)
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
          ...e.response?.data,
          installing: false
        }
      });
    });
};

export const startProjectBuilds = (pid, payload) => (dispatch) => {
  dispatch({
    type: actionTypes.START_PROJECT_BUILDS,
    payload: {
      installing: true
    }
  });
  axios
    .post(`/api/v1/runner/${pid}/runProject`, payload)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.START_PROJECT_BUILDS,
          payload: {
            ...res.data,
            showMessage: "success",
            details: `Project Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.START_PROJECT_BUILDS,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Start Project Execution"
        }
      });
    });
};

export const stopProjectBuilds = (pid) => (dispatch) => {
  dispatch(resetProjectFlags());
  axios
    .post(`/api/v1/runner/${pid}/stop`)
    .then((res) => {
      if (res?.data)
        dispatch({
          type: actionTypes.STOP_PROJECT_BUILDS,
          payload: {
            ...res.data,
            showMessage: "success",
            message: "Project Execution Stopped Successfully",
            details: `Project Id: ${pid}`
          }
        });
    })
    .catch((e) => {
      dispatch({
        type: actionTypes.STOP_PROJECT_BUILDS,
        payload: {
          ...e.response?.data,
          showMessage: "error",
          message: "Failed to Stop Project Execution",
          details: `Project Id: ${pid}`
        }
      });
    });
};
