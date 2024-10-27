import React, { Fragment, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Security } from "@okta/okta-react";
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";

import * as actionTypes from "../redux/actions";
import WebContext from "../views/context/WebContext";
import LocalStorageService, { setStoreItem } from "../redux/actions/LocalStorageService";
import { ACCESS_TOKEN_STORAGE_KEY, CSRF_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY as REFRESH_TOKEN_STOTAGE_KEY } from "../Constants";

axios.defaults.withCredentials = true;

const tokens = {};

const isOktaEnabled = process.env.OKTA_ENABLED;

function AuthGuard({ product, children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  let oktaAuth =
    isOktaEnabled &&
    new OktaAuth({
      issuer: "https://ebates.okta.com/oauth2/default",
      clientId: "0oa1ylxe5w88aKR1U0h8",
      redirectUri: `${window.location.origin}${product.page.urlPrefix}/callback`,
      scopes: ["openid", "profile", "email"]
    });

  const { jwtToken: token } = useSelector((state) => state.login);
  const { project, scenario } = useContext(WebContext);

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    navigate(toRelativeUrl(originalUri || "/", window.location.origin));
  };

  const redirectRoute = () => {
    console.log(`Redirect Route: ${location?.pathname}`);
    navigate(location?.pathname, { redirectUrl: location?.pathname });
  };

  const redirectToLogin = () => {
    console.trace(`Redirecting to Login`);
    LocalStorageService.clear();
    navigate(`${product.page.urlPrefix}/login`, { replace: true });
  };

  const updateRequestInterceptor = () => {
    axios.interceptors.request.use(
      (config) => {
        if (!config.url.startsWith("/api/v1/accounts")) {
          const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
          if (token) {
            config.withCredentials = false;
            config.withXSRFToken = false;
            config.headers["Accept"] = "*/*";
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["Access-Control-Allow-Headers"] =
              "Origin, Content-Type, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Authorization, X-Requested-With, client-agent";
            config.headers["X-CSRF-Token"] = localStorage.getItem(CSRF_TOKEN_STORAGE_KEY);
            if (project?.id) {
              config.headers["project-id"] = project?.id;
            }
            if (scenario?.id) {
              config.headers["scenario-id"] = scenario?.id;
            }
          } else {
            return cancelRequest(config);
          }
        }
        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );
  };

  const cancelRequest = (originalRequest) => {
    console.trace("Cancelling requests");
    const controller = new AbortController();
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    originalRequest.cancelToken = source.token;
    originalRequest.signal = controller.signal;
    source.cancel("Operation canceled by the user.");
    redirectToLogin();
    return originalRequest;
  };

  useEffect(() => {
    if (!isOktaEnabled) {
      dispatch({
        type: actionTypes.LOGIN_TOKEN,
        payload: {
          jwtToken: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
        }
      });
      updateRequestInterceptor();
    }
  }, []);

  useEffect(() => {
    if (!isOktaEnabled) {
      const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (token) {
        updateRequestInterceptor();
        axios.interceptors.response.use(
          (response) => response,
          (error) => {
            console.log(error);
            const originalRequest = error.config;
            if (!originalRequest.url.startsWith("/api/v1/accounts") && !localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)) {
              return cancelRequest(originalRequest);
            }
            // Prevent infinite loops
            if (error.response && error.response.status === 401 && originalRequest.url.startsWith("/api/v1/accounts")) {
              //alert("Your Session Has Expired, Please Login again");
              console.warn("Refresh token not available.");
              redirectToLogin();
              return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem(REFRESH_TOKEN_STOTAGE_KEY);
            if (refreshToken && error.response?.status === 401 && error.response?.data?.error?.includes("jwt expired")) {
              console.warn("Calling Refresh token:", refreshToken);
              return axios
                .post(
                  "/api/v1/accounts/refresh-token",
                  {
                    refreshToken: localStorage.getItem(REFRESH_TOKEN_STOTAGE_KEY)
                  },
                  {
                    withCredentials: true,
                    headers: {
                      "X-CSRF-Token": localStorage.getItem(CSRF_TOKEN_STORAGE_KEY),
                      Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)}`
                    }
                  }
                )
                .then((response) => {
                  console.log(response);
                  if (tokens[refreshToken] || response.status == 200) {
                    if (!tokens[refreshToken]) {
                      tokens[refreshToken] = {
                        ...response.data,
                        ...jwtDecode(response.data.jwtToken),
                        dt: new Date()
                      };
                    }

                    setStoreItem(ACCESS_TOKEN_STORAGE_KEY, response.data.jwtToken);
                    setStoreItem(REFRESH_TOKEN_STOTAGE_KEY, response.data.refreshToken);
                    setStoreItem(CSRF_TOKEN_STORAGE_KEY, response.data.csrfToken);

                    updateRequestInterceptor();

                    dispatch({
                      type: actionTypes.LOGIN_SUCCESS,
                      payload: tokens[refreshToken]
                    });

                    if (!response.data.jwtToken) {
                      cancelRequest(originalRequest);
                      return Promise.reject();
                    }
                    originalRequest.headers["Authorization"] = "Bearer " + response.data.jwtToken;
                    originalRequest.headers["X-CSRF-Token"] = response.data.csrfToken;
                    return axios(originalRequest);
                  } else {
                    cancelRequest(originalRequest);
                    return Promise.reject();
                  }
                })
                .catch((e) => console.error(e));
            } else if (error.response?.status === 403) {
              cancelRequest(originalRequest);
            }
            return Promise.reject(error);
          }
        );
        if (location?.pathname != `${product.page.urlPrefix}/login`) redirectRoute();
      } else {
        delete axios.defaults.headers.common["Authorization"];
        delete axios.defaults.headers.common["X-CSRF-Token"];
        axios.interceptors.request.use(
          (config) => {
            delete config.headers["Authorization"];
            delete config.headers["X-CSRF-Token"];
            return config;
          },
          (error) => {
            Promise.reject(error);
          }
        );
        redirectToLogin();
      }
    }
  }, [isOktaEnabled, token]);

  if (isOktaEnabled)
    return (
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        {children}
      </Security>
    );
  return <Fragment>{children}</Fragment>;
}

export default AuthGuard;
