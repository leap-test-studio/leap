// action - state management
import { ACCESS_TOKEN_STORAGE_KEY, CSRF_TOKEN_STORAGE_KEY, PROFILE_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "../../Constants";
import * as actionTypes from "../actionsTypes";
import LocalStorageService, { setStoreItem } from "../actions/LocalStorageService";

const initialState = {
  success: false,
  loading: false,
  error: "",
  message: null,
  otpSuccess: null,
  resetSuccess: null,
  changepwdSuccess: null,
  jwtToken: null,
  refreshToken: null,
  user: null,
  loadingOktaInfo: false
};

const LoginReducer = function (state = initialState, { payload, type }) {
  state.jwtToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  switch (type) {
    case actionTypes.LOGIN_LOADING: {
      return {
        ...state,
        loading: true,
        success: false,
        message: null,
        otpSuccess: null,
        resetSuccess: null,
        changepwdSuccess: null
      };
    }
    case actionTypes.LOGIN_SUCCESS: {
      LocalStorageService.setItem(PROFILE_STORAGE_KEY, payload);
      setStoreItem(ACCESS_TOKEN_STORAGE_KEY, payload.jwtToken);
      setStoreItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
      setStoreItem(CSRF_TOKEN_STORAGE_KEY, payload.csrfToken);
      return {
        ...state,
        success: true,
        loading: false,
        user: payload,
        ...payload
      };
    }
    case actionTypes.RESET_PASSWORD: {
      return {
        ...state,
        success: true,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.RESET_PASSWORD_ERROR: {
      return {
        ...state,
        success: false,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.RESETNEW_PASSWORD: {
      return {
        ...state,
        resetSuccess: true,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.RESETNEW_PASSWORD_ERROR: {
      return {
        ...state,
        resetSuccess: false,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.OTPVERIFY_EMAIL: {
      return {
        ...state,
        otpSuccess: true,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.OTPVERIFY_EMAIL_ERROR: {
      return {
        ...state,
        otpSuccess: false,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.CHANGE_PASSWORD: {
      return {
        ...state,
        changepwdSuccess: true,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.CHANGE_PASSWORD_ERROR: {
      return {
        ...state,
        changepwdSuccess: false,
        loading: false,
        message: payload.message
      };
    }
    case actionTypes.LOGIN_ERROR: {
      return {
        success: false,
        loading: false,
        ...payload
      };
    }
    case actionTypes.RESET_LOGIN:
    case actionTypes.LOGIN_TOKEN: {
      return {
        ...state,
        ...payload
      };
    }
    default:
  }
  return state;
};

export default LoginReducer;
