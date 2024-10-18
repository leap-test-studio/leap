// action - state management
import * as actionTypes from "../actions";

const initialState = {
  accounts: [],
  listLoading: false,
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  details: null,
  isFirstAccount: false,
  accountData: null
};

const AccountReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_ACCOUNT_LIST: {
      return {
        ...state,
        listLoading: false,
        isFirstAccount: Array.isArray(payload?.items) && payload.items.length === 0,
        accounts: payload?.items || []
      };
    }
    case actionTypes.GET_ACCOUNT:
    case actionTypes.UPDATE_ACCOUNT:
    case actionTypes.RESET_ACCOUNT:
    case actionTypes.CREATE_ACCOUNT:
    case actionTypes.DELETE_ACCOUNT: {
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

export default AccountReducer;
