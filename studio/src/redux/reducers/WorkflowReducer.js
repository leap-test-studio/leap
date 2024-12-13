// action - state management
import * as actionTypes from "../actionsTypes";

const initialState = {
  workflows: [],
  listLoading: false,
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  details: null,
  isFirstWorkflow: false,
  wf: {},
  savingChanges: false,
  loading: false,
  message: null,
  showMessage: false,
  simulationData: null
};

const WorkflowReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_WF_LIST: {
      return {
        ...state,
        listLoading: false,
        isFirstWorkflow: Array.isArray(payload?.items) && payload.items.length === 0,
        workflows: payload?.items || []
      };
    }
    case actionTypes.GET_WF:
    case actionTypes.UPDATE_WF:
    case actionTypes.RESET_WF:
    case actionTypes.CREATE_WF:
    case actionTypes.DELETE_WF:
    case actionTypes.TEST_SEQUENCER: {
      return {
        ...state,
        ...payload
      };
    }
    case actionTypes.TEST_SEQUENCER_DELETE_EDGE: {
      const changes = [...state.edges];
      const index = changes.findIndex((e) => e.id === payload);
      if (index > -1) {
        changes.splice(index, 1);
        state.edges = changes;
      }

      return {
        ...state,
        ...payload
      };
    }
    case actionTypes.CONFIG_SIMULATION_BUTTON:
      return {
        ...state,
        simulationData: payload
      };
    default: {
      return {
        ...state
      };
    }
  }
};

export default WorkflowReducer;
