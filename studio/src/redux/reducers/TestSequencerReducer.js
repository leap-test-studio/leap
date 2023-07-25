// action - state management
import * as actionTypes from "../actions";

const initialState = {
  nodes: [
    {
      id: "root",
      type: "root",
      data: { label: "Start" },
      position: { x: 250, y: 5 }
    },
    {
      id: "TS0001",
      data: { label: "TS0001" },
      type: "ts",
      position: { x: 300, y: 30 },
      style: { width: 300, height: 200 }
    },
    {
      id: "TS0001-S",
      data: { label: "TS0001-S" },
      type: "tss",
      position: { x: 5, y: 100 },
      parentNode: "TS0001"
    },
    {
      id: "TS0001-E",
      data: { label: "TS0001-E" },
      type: "tse",
      position: { x: 250, y: 100 },
      parentNode: "TS0001"
    },
    {
      id: "TC0001",
      data: { label: "TC0001" },
      type: "tc",
      position: { x: 50, y: 50 },
      parentNode: "TS0001",
      style: { width: 100 }
    },
    {
      id: "TC0002",
      data: { label: "TC0002" },
      type: "tc",
      position: { x: 50, y: 100 },
      parentNode: "TS0001",
      style: { width: 100 }
    },
    {
      id: "TC0003",
      data: { label: "TC0003" },
      type: "tc",
      position: { x: 50, y: 150 },
      parentNode: "TS0001",
      style: { width: 100 }
    }
  ],
  edges: [{ id: "e1-2", source: "root", target: "TS0001", animated: true }]
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
