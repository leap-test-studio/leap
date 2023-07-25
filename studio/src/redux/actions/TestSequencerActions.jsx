// action - state management
import * as actionTypes from "../actions";

export const deleteEdge = (payload) => (dispatch) => {
  dispatch({
    type: actionTypes.TEST_SEQUENCER_DELETE_EDGE,
    payload
  });
};
