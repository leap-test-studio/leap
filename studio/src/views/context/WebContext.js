import React from "react";
import { DEFAULT_FOOTER_HEIGHT, DEFAULT_HEADER_HEIGHT } from "./constants";

const WebContext = React.createContext({
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
  changeTestScenario: null,
  changeProject: null,
  resetContext: null
});

export default WebContext;
