// action - state management
import * as actionTypes from "../actions";

const initialState = {
  tenants: [],
  listLoading: false,
  loading: false,
  isError: false,
  showMessage: false,
  message: null,
  details: null,
  isFirstTenant: false,
  accountData: null
};

const TenantReducer = function (state = initialState, { payload, type }) {
  switch (type) {
    case actionTypes.GET_TENANT_LIST: {
      return {
        ...state,
        listLoading: false,
        isFirstTenant: Array.isArray(payload?.items) && payload.items.length === 0,
        tenants: payload?.items || []
      };
    }
    case actionTypes.GET_TENANT:
    case actionTypes.UPDATE_TENANT:
    case actionTypes.RESET_TENANT:
    case actionTypes.CREATE_TENANT:
    case actionTypes.DELETE_TENANT: {
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

export default TenantReducer;
