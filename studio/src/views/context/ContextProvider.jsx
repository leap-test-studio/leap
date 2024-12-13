import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";

import { E_ROLE, E_SSE, RoleGroups } from "engine_utils";
import { CustomAlertDialog } from "@utilities/.";
import LocalStorageService from "@redux-actions/LocalStorageService";
import { openProject, resetTestScenarioFlags, resetTestCaseFlags, actionTypes } from "@redux-actions/.";
import WebContext from "@WebContext";

import { DEFAULT_FOOTER_HEIGHT, DEFAULT_HEADER_HEIGHT, PROJECT_STORAGE_KEY, SUITE_STORAGE_KEY } from "../../Constants";
import Events from "./events";

const initialState = {
  project: null,
  scenario: null,
  open: false,
  online: true,
  role: {
    isAdmins: false,
    isManagers: false,
    isLeads: false,
    isEngineer: false
  }
};

const eventStream = new Events("/event-stream");

function ContextProvider({ children }) {
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.login);
  const [state, setState] = useState({
    ...initialState,
    project: LocalStorageService.getItem(PROJECT_STORAGE_KEY),
    scenario: LocalStorageService.getItem(SUITE_STORAGE_KEY)
  });
  const [isOnline, setIsOnline] = useState(false);

  const [windowDimension, detectHW] = useState({
    headerHeight: DEFAULT_HEADER_HEIGHT,
    footerHeight: DEFAULT_FOOTER_HEIGHT,
    maxContentHeight: window.innerHeight - DEFAULT_HEADER_HEIGHT - DEFAULT_FOOTER_HEIGHT,
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  });

  const detectSize = () => {
    detectHW({
      headerHeight: DEFAULT_HEADER_HEIGHT,
      footerHeight: DEFAULT_FOOTER_HEIGHT,
      maxContentHeight: window.innerHeight - DEFAULT_HEADER_HEIGHT - DEFAULT_FOOTER_HEIGHT - 1,
      winWidth: window.innerWidth,
      winHeight: window.innerHeight
    });
  };

  const resetContext = () => {
    LocalStorageService.removeItem(PROJECT_STORAGE_KEY);
    LocalStorageService.removeItem(SUITE_STORAGE_KEY);
    setState(initialState);
    dispatch(openProject(null));
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => window.removeEventListener("resize", detectSize);
  }, [windowDimension]);

  const changeProject = (name) => {
    const project = projects?.find((p) => p.name === name);
    setState({
      ...state,
      project
    });
    LocalStorageService.setItem(PROJECT_STORAGE_KEY, project);
    dispatch(openProject(null));
    dispatch(
      resetTestScenarioFlags({
        testsuites: []
      })
    );
    dispatch(
      resetTestCaseFlags({
        testcases: []
      })
    );
  };

  const changeTestScenario = (scenario) => {
    setState({
      ...state,
      scenario
    });
    if (scenario) LocalStorageService.setItem(SUITE_STORAGE_KEY, scenario);
    else LocalStorageService.removeItem(SUITE_STORAGE_KEY);
    dispatch(
      resetTestCaseFlags({
        testcases: []
      })
    );
  };

  const setUserProfile = (userProfile) => {
    setState({
      ...state,
      userProfile
    });
  };

  const setUserRole = (role) => {
    setState({
      ...state,
      role: {
        isAdmins: RoleGroups.Admins.includes(role),
        isManagers: RoleGroups.Managers.includes(role),
        isLeads: RoleGroups.Leads.includes(role),
        isEngineer: role === E_ROLE.Engineer
      }
    });
  };

  const getRole = () => {
    const UserInfo = LocalStorageService.getUserInfo();
    const role = UserInfo?.role;
    return {
      isAdmins: RoleGroups.Admins.includes(role),
      isManagers: RoleGroups.Managers.includes(role),
      isLeads: RoleGroups.Leads.includes(role),
      isEngineer: role === E_ROLE.Engineer
    };
  };

  useEffect(() => {
    if (user?.role) {
      setUserRole(user?.role);
    }
  }, [user]);

  useEffect(() => {
    const updateOnlineStatus = (event) => setIsOnline(event?.type === "online");
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    eventStream.client.onerror = () => setIsOnline(false);
    eventStream.client.addEventListener("open", () => setIsOnline(true));
    eventStream.register(E_SSE.WF_LOG, (event) => {
      try {
        console.log(event);
      } catch (e) {
        console.error(e);
      }
    });
    eventStream.register(E_SSE.WF_STATUS, (event) => {
      try {
        dispatch({
          type: actionTypes.GET_WF,
          payload: { wf: event }
        });
      } catch (e) {
        console.error(e);
      }
    });
  }, []);
  return (
    <WebContext.Provider
      value={{
        ...state,
        isProjectSelected: !isEmpty(state.project),
        loaded: Array.isArray(projects),
        changeProject,
        changeTestScenario,
        resetContext,
        setUserProfile,
        setUserRole,
        getRole,
        windowDimension,
        online: isOnline
      }}
    >
      {children}
      <CustomAlertDialog
        level="warn"
        message={
          <p>
            Project is not reachable at the moment. <br />
            You might want to check your network connection.
          </p>
        }
        showDialog={state.open}
        onClose={() => setState({ ...state, open: false })}
      />
    </WebContext.Provider>
  );
}

export default ContextProvider;
