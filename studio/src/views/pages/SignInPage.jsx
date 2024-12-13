import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import isEmpty from "lodash/isEmpty";

import { IconRenderer } from "@utilities/.";
import { loginWithEmailAndPassword, actionTypes } from "@redux-actions/.";
import LocalStorageService from "@redux-actions/LocalStorageService";

import LogoRenderer, { LOGO } from "./layout/LogoRenderer";
import { OKTA_ENABLED } from "../../Constants";

export function SignInPage({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success, error, loading, oktaUserProfile } = useSelector((state) => state.login);
  const { name, version, description, page } = product;
  const { oktaAuth } = OKTA_ENABLED ? useOktaAuth() : {};

  useEffect(() => {
    document.title = `${name} - ${description}`;
    if (OKTA_ENABLED) {
      oktaAuth.isAuthenticated().then((isAuthenticated) => {
        if (isAuthenticated) {
          setTimeout(() => {
            console.log(`Login Succeeded: redirecting to ${page.urlPrefix}${page.landingPage}`);
            navigate(`${page.urlPrefix}${page?.landingPage}`, { replace: true });
          }, 5000);
        } else {
          oktaAuth.signInWithRedirect({ originalUri: `${page.urlPrefix}${page?.landingPage}` }).catch((e) => console.error(e));
        }
      });
    } else {
      LocalStorageService.clear();
    }
  }, []);

  useEffect(() => {
    if (!OKTA_ENABLED) {
      if (!isEmpty(error)) {
        setTimeout(
          () =>
            dispatch({
              type: actionTypes.LOGIN_ERROR,
              payload: ""
            }),
          5000
        );
      } else if (success) {
        console.log(`Login Succeeded: redirecting to ${page.urlPrefix}${page.landingPage}`);
        navigate(`${page.urlPrefix}${page?.landingPage}`, { replace: true });
      }
    }
  }, [OKTA_ENABLED, success, error]);

  const [formdata, setformdata] = useState({ email: "", password: "" });

  const { email, password } = formdata;
  const [passwordShow, setPasswordShow] = useState(false);
  const pass = useRef();
  const change = (e) => {
    setformdata({ ...formdata, [e.target.name]: e.target.value });
  };
  const onSubmit = useCallback(() => dispatch(loginWithEmailAndPassword(formdata)), [formdata, dispatch]);

  const showpassword = () => {
    setPasswordShow(!passwordShow);
    pass.current.type = passwordShow ? "password" : "text";
  };
  return (
    <div
      className="flex bg-cover bg-center h-screen w-full select-none"
      style={{ backgroundImage: "url('/assets/img/bg.jpg')", backgroundColor: "#001A38" }}
    >
      <div className="flex w-1/2 h-screen items-center justify-center">
        <div className="max-w-sm transform duration-[300ms] hover:scale-110 cursor-pointer items-center justify-center">
          <div className="flex flex-col justify-center items-center">
            <LogoRenderer className="size-40" />
            <div className="flex flex-row space-x-5 items-center">
              <div className="flex flex-col space-y-2 items-center">
                <LOGO className="w-60" />
                <div className="cursor-pointer text-color-0300 font-semibold">{description}</div>
                <label className="text-slate-500 text-[10px]">Version: v{version}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-1/2 h-screen items-center justify-center">
        {!OKTA_ENABLED ? (
          <div
            className="py-4 px-10 max-w-7xl items-center justify-center backdrop-blur-sm bg-white/10 p-5 rounded shadow-md"
            style={{ border: "1.5px solid #475569" }}
          >
            <h2 className="text-4xl text-white font-display font-semibold text-left xl:text-4xl xl:text-bold">Sign In</h2>
            <div className="mt-8 w-60 text-white">
              <label htmlFor="username" className="placeholder-white block mt-2 text-xs font-medium">
                Username/e-mail
              </label>
              <input
                id="#/properties/username"
                className="block h-9 w-full rounded-md mt-2 text-sm font-light bg-color-1000/10 backdrop-blur-sm"
                type="email"
                value={email}
                placeholder="Enter Email"
                name="email"
                onChange={change}
              />
              <label className="placeholder-white block mt-2 text-xs font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="#/properties/password"
                  ref={pass}
                  className="block h-9 z-10 w-full rounded-md text-sm font-light bg-color-1000/10 backdrop-blur-sm"
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  name="password"
                  onChange={change}
                />
                <span htmlFor="#/properties/password-toggle" className="absolute inset-y-0 right-0 flex items-center w-5 mr-2" onClick={showpassword}>
                  <IconRenderer
                    icon={passwordShow ? "VisibilityOff" : "Visibility"}
                    className={passwordShow ? "text-cds-yellow-0500" : "text-color-0600"}
                    fontSize="small"
                  />
                </span>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <button
                  id="signin-btn"
                  type="submit"
                  onClick={onSubmit}
                  className={`${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  } w-full text-center inline-flex items-center justify-center px-4 py-2 text-xs font-semibold font-display leading-6 text-white transition duration-150 ease-in-out rounded bg-gradient-to-b from-color-0500 to-color-0700 hover:from-color-0400 hover:to-color-0700 shadow-lg`}
                >
                  {loading && (
                    <svg className="size-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {loading ? "Loading..." : "Sign In"}
                </button>
              </div>
              <p className="mt-2 h-6 text-red-600 w-full text-center">{error}</p>
            </div>
          </div>
        ) : oktaUserProfile != null ? (
          <div
            className="h-fit w-fit flex flex-col items-center justify-center backdrop-blur-sm bg-white/5 p-5 rounded-lg shadow-md"
            style={{ border: "1.5px solid #475569" }}
          >
            <label className="text-3xl text-white pb-5">Welcome</label>
            <div className="inline-flex">
              <label className="text-6xl font-semibold text-white">{oktaUserProfile.given_name}</label>
              <label className="text-6xl font-semibold text-slate-300 px-4">{oktaUserProfile.family_name}</label>
            </div>
            <label className="text-2xl font-semibold text-slate-300 pt-5">{oktaUserProfile.email}</label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SignInPage;
