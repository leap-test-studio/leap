import axios, { CanceledError } from "axios";
// action - state management
import * as actionTypes from "../actions";
import { jwtDecode } from "jwt-decode";

const Roles = ["Admin", "Manager", "Lead", "Engineer"];

export const logoutUser = () => async (dispatch) => {
  const refreshToken = localStorage.getItem("refreshToken");
  const jwTToken = localStorage.getItem("jwt_token");

  try {
    await axios.post(
      "/api/v1/accounts/revoke-token",
      {
        refreshToken
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-Token": localStorage.getItem("csrfToken"),
          Authorization: "Bearer " + jwTToken
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
  localStorage.clear();
  dispatch({
    type: actionTypes.LOGIN_SUCCESS,
    payload: {
      jwtToken: null,
      refreshToken: null,
      user: null,
      success: false
    }
  });
};

export const loginWithEmailAndPassword =
  ({ email, password }) =>
  (dispatch) => {
    dispatch({
      type: actionTypes.LOGIN_LOADING
    });
    axios
      .post(
        "/api/v1/accounts/authenticate",
        {
          email,
          password
        },
        {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          }
        }
      )
      .then((res) => {
        if (res.status === 200) {
          const user = jwtDecode(res.data.jwtToken);
          if (user instanceof CanceledError) {
            return dispatch({
              type: actionTypes.LOGIN_ERROR,
              payload: "Request Timeout"
            });
          } else if (Roles.includes(res.data.role)) {
            return dispatch({
              type: actionTypes.LOGIN_SUCCESS,
              payload: {
                user,
                ...res.data
              }
            });
          } else {
            return dispatch({
              type: actionTypes.LOGIN_ERROR,
              payload: "Unauthorized Access"
            });
          }
        } else {
          dispatch({
            type: actionTypes.LOGIN_ERROR,
            payload: res.data.error
          });
        }
      })
      .catch((e) =>
        dispatch({
          type: actionTypes.LOGIN_ERROR,
          payload: e.message
        })
      );
  };

export function forgotPassword(body) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOGIN_LOADING
    });

    axios
      .post("/api/v1/accounts/forgot-password", body)
      .then((res) => {
        if (res.data) {
          dispatch({
            type: actionTypes.RESET_PASSWORD,
            payload: res.data
          });
        }
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.RESET_PASSWORD_ERROR,
          payload: error.response.data
        });
      });
  };
}

export function resetPassword(body) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOGIN_LOADING
    });

    axios
      .post("/api/v1/accounts/reset-password", body)
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.RESETNEW_PASSWORD,
            payload: res.data
          });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.RESETNEW_PASSWORD_ERROR,
          payload: error.response.data
        });
      });
  };
}

export function changePassword(body) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOGIN_LOADING
    });

    axios
      .post("/api/v1/accounts/change-password", body)
      .then((res) => {
        if (res?.data)
          dispatch({
            type: actionTypes.CHANGE_PASSWORD,
            payload: res.data
          });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CHANGE_PASSWORD_ERROR,
          payload: error.response.data
        });
      });
  };
}

export function otpVerification(body) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOGIN_LOADING
    });

    axios
      .post("/api/v1/accounts/validate-reset-token", body)
      .then((res) => {
        if (res?.data)
          if (res.status === 200) {
            dispatch({
              type: actionTypes.OTPVERIFY_EMAIL,
              payload: res.data
            });
          } else {
            dispatch({
              type: actionTypes.OTPVERIFY_EMAIL_ERROR,
              payload: res.data
            });
          }
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.OTPVERIFY_EMAIL_ERROR,
          payload: error.response.data
        });
      });
  };
}
