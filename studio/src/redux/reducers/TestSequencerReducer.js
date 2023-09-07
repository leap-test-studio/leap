// action - state management
import * as actionTypes from "../actions";

const initialState = {
  loading: false,
  message: null,
  showMessage: false,
  simulationData: null,
  nodes: [],
  edges: []
};

const TestSequencerReducer = function (state = initialState, { payload, type }) {
  switch (type) {
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
      return state;
    }
  }
};

export default TestSequencerReducer;
