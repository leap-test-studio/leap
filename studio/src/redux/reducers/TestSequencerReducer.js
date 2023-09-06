// action - state management
import * as actionTypes from "../actions";

const initialState = {
  nodes: [
    {
      id: "start",
      type: "SN",
      data: { label: "Start" },
      position: { x: 300, y: 300 }
    }
  ],
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

    default: {
      return state;
    }
  }
};

export default TestSequencerReducer;
