// action - state management
import * as actionTypes from "../actions";

const initialState = {
  projects: [],
  loading: false,
  isProjectCreated: false,
  isProjectCreateFailed: false,
  isProjectDeleted: false,
  isProjectDeleteFailed: false,
  isProjectUpdated: false,
  isProjectUpdateFailed: false,
  isFirstProject: false
};

const ProjectReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_PROJECT_LIST: {
      return {
        ...state,
        isFirstProject: Array.isArray(payload.items) && payload.items.length === 0,
        projects: payload.items
      };
    }
    case actionTypes.START_PROJECT_BUILDS:
    case actionTypes.STOP_PROJECT_BUILDS:
    case actionTypes.UPDATE_PROJECT:
    case actionTypes.CREATE_PROJECT:
    case actionTypes.DELETE_PROJECT: {
      return {
        ...state,
        ...payload
      };
    }
    default: {
      return {
        ...state
      };
    }
  }
};

export default ProjectReducer;
