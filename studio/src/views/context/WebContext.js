import React from "react";

const WebContext = React.createContext({
  isProjectSelected: false,
  project: null,
  suite: null,
  online: false,
  routes: [],
  windowDimension: {
    headerHeight: 40,
    footerHeight: 12,
    maxContentHeight: window.innerHeight,
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  },
  changeTestScenario: null,
  changeProject: null,
  resetContext: null
});

export default WebContext;
