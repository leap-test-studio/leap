import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useOktaAuth } from "@okta/okta-react";

import { Centered, Spinner } from "@utilities/.";
import { registerOktaUser, actionTypes } from "@redux-actions/.";
import LocalStorageService, { setStoreItem } from "@redux-actions/LocalStorageService";
import WebContext from "@WebContext";

import Product from "../product.json";
import { Page } from "../views/pages/common/PageLayoutComponents";
import { ACCESS_TOKEN_STORAGE_KEY, OKTA_ENABLED, PROFILE_STORAGE_KEY } from "../Constants";

export const RequiredAuth = ({ children }) => {
  const dispatch = useDispatch();
  const { setUserProfile, project, scenario } = useContext(WebContext);
  const { page } = Product;
  const { oktaAuth, authState } = OKTA_ENABLED ? useOktaAuth() : {};
  const { oktaUserProfile } = useSelector((state) => state.login);

  useEffect(() => {
    if (OKTA_ENABLED) {
      axios.interceptors.request.use((config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (token) {
          config.withCredentials = false;
          config.withXSRFToken = false;
          config.headers["Accept"] = "*/*";
          config.headers["Authorization"] = `Bearer ${token}`;
          config.headers["Access-Control-Allow-Headers"] =
            "Origin, Content-Type, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Authorization, X-Requested-With, client-agent";
          if (project?.id) {
            config.headers["project-id"] = project?.id;
          }
          if (scenario?.id) {
            config.headers["scenario-id"] = scenario?.id;
          }
        } else {
          const controller = new AbortController();
          controller.abort("Okta Token Not Available");
          config.signal = controller.signal;
        }
        return config;
      });
    }
  }, [OKTA_ENABLED]);

  useEffect(() => {
    if (!OKTA_ENABLED || oktaUserProfile) {
      return;
    }
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          LocalStorageService.removeItem(PROFILE_STORAGE_KEY);
        }
        return Promise.reject(error);
      }
    );
    oktaAuth.isAuthenticated().then((isAuthenticated) => {
      if (isAuthenticated) {
        oktaAuth
          .getUser()
          .then((userProfile) => {
            const token = oktaAuth.getAccessToken();
            token && setStoreItem(ACCESS_TOKEN_STORAGE_KEY, token);
            setUserProfile(userProfile);
            dispatch({
              type: actionTypes.LOGIN_TOKEN,
              payload: {
                oktaUserProfile: userProfile
              }
            });
            dispatch(registerOktaUser(userProfile));
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        oktaAuth
          .signInWithRedirect({ originalUri: `${page.urlPrefix}${page.landingPage}` })
          .then(() => {
            dispatch({
              type: actionTypes.LOGIN_TOKEN,
              payload: {
                signin: true
              }
            });
          })
          .catch((e) => {
            console.error(e);
            dispatch({
              type: actionTypes.LOGIN_TOKEN,
              payload: {
                signin: false
              }
            });
          });
      }
    });
  }, [OKTA_ENABLED, oktaUserProfile, oktaAuth, authState?.isAuthenticated]);

  if (OKTA_ENABLED && (!authState || !authState?.isAuthenticated)) {
    return (
      <Page>
        <Centered>
          <Spinner />
        </Centered>
      </Page>
    );
  }

  return <>{children}</>;
};
