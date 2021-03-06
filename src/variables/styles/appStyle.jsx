// ##############################
// // // App styles
// #############################

import { drawerWidth, drawerWidthClosed, transition, container } from "variables/styles.jsx";

const appStyle = theme => ({
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh"
  },
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    },
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    overflowScrolling: 'touch'
  },
  mainPanelExpanded: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidthClosed}px)`
    },
    overflowX: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: 'touch'
  },
  content: {
    marginTop: "20px",
    padding: "30px 15px",
    minHeight: "calc(100% - 123px)"
  },
  container,
  map: {
    marginTop: "70px"
  }
});

export default appStyle;
