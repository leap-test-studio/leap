// action - state management
import * as actionTypes from "../actions";

const initialState = {
  severity: "info",
  toggleSnackbar: false,
  snackbarMessage: null
};

const MessageReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.TOGGLE_SNACKBAR_CLOSE: {
      return {
        ...state,
        ...payload
      };
    }

    default:
  }
  return state;
};

export default MessageReducer;
