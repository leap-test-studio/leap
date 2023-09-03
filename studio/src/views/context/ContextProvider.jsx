import { useEffect, useState } from "react";
import WebContext from "./WebContext";
import { useDispatch, useSelector } from "react-redux";
import CustomAlertDialog from "../utilities/CustomAlertDialog";
import LocalStorageService from "../../redux/actions/LocalStorageService";
import isEmpty from "lodash/isEmpty";
import { openProject } from "../../redux/actions/ProjectActions";

const DEFAULT_HEADER_HEIGHT = 40;
const DEFAULT_FOOTER_HEIGHT = 0;

const initialState = {
  project: null,
  scenario: null,
  open: false,
  online: true
};

function ContextProvider({ children }) {
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.project);
  const [state, setState] = useState({
    ...initialState,
    project: LocalStorageService.getItem("project"),
    scenario: LocalStorageService.getItem("scenario")
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
    LocalStorageService.removeItem("project");
    LocalStorageService.removeItem("scenario");
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
    LocalStorageService.setItem("project", project);
    dispatch(openProject(null));
  };

  const changeTestScenario = (scenario) => {
    setState({
      ...state,
      scenario
    });
    if (scenario) LocalStorageService.setItem("scenario", scenario);
    else LocalStorageService.removeItem("scenario");
  };

  return (
    <WebContext.Provider
      value={{
        ...state,
        isProjectSelected: !isEmpty(state.project),
        loaded: Array.isArray(projects),
        changeProject,
        changeTestScenario,
        resetContext,
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
