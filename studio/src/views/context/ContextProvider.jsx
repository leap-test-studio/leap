import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";

import WebContext from "./WebContext";
import { CustomAlertDialog } from "../utilities";
import LocalStorageService from "../../redux/actions/LocalStorageService";
import { openProject } from "../../redux/actions/ProjectActions";
import { authRoles } from "../../auth/authRoles";
import { resetTestScenarioFlags } from "../../redux/actions/TestScenarioActions";
import { resetTestCaseFlags } from "../../redux/actions/TestCaseActions";
import { DEFAULT_FOOTER_HEIGHT, DEFAULT_HEADER_HEIGHT, PROJECT_STORAGE_KEY, SUITE_STORAGE_KEY } from "../../Constants";

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

function ContextProvider({ children }) {
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.login);
  const [state, setState] = useState({
    ...initialState,
    project: LocalStorageService.getItem(PROJECT_STORAGE_KEY),
    scenario: LocalStorageService.getItem(SUITE_STORAGE_KEY)
  });

  const [windowDimension, detectHW] = useState({
    headerHeight: DEFAULT_HEADER_HEIGHT,
    footerHeight: DEFAULT_FOOTER_HEIGHT,
    maxContentHeight: window.innerHeight - DEFAULT_HEADER_HEIGHT - DEFAULT_FOOTER_HEIGHT - 1,
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
        isAdmins: authRoles.admin.includes(role),
        isManagers: authRoles.manager.includes(role),
        isLeads: authRoles.lead.includes(role),
        isEngineer: role === "Engineer"
      }
    });
  };

  const getRole = () => {
    const UserInfo = LocalStorageService.getUserInfo();
    const role = UserInfo?.role;
    return {
      isAdmins: authRoles.admin.includes(role),
      isManagers: authRoles.manager.includes(role),
      isLeads: authRoles.lead.includes(role),
      isEngineer: role === "Engineer"
    };
  };
  useEffect(() => {
    if (user?.role) {
      setUserRole(user?.role);
    }
  }, [user]);

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
        windowDimension
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
