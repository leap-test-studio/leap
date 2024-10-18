import React from "react";
import { DEFAULT_FOOTER_HEIGHT, DEFAULT_HEADER_HEIGHT } from "../../Constants";

const WebContext = React.createContext({
  userProfile: null,
  isProjectSelected: false,
  project: null,
  scenario: null,
  online: false,
  routes: [],
  windowDimension: {
    headerHeight: DEFAULT_HEADER_HEIGHT,
    footerHeight: DEFAULT_FOOTER_HEIGHT,
    maxContentHeight: window.innerHeight,
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  },
  setUserProfile: null,
  setUserRole: null,
  changeTestScenario: null,
  changeProject: null,
  resetContext: null,
  getRole: null,
  role: {
    isAdmins: false,
    isManagers: false,
    isLeads: false,
    isEngineer: false
  }
});

export default WebContext;
