import { combineReducers } from "redux";
import LoginReducer from "./LoginReducer";
import ProjectReducer from "./ProjectReducer";
import DashboardReducer from "./DashboardReducer";
import TestSuiteReducer from "./TestSuiteReducer";
import TestCaseReducer from "./TestCaseReducer";
import TestSequencerReducer from "./TestSequencerReducer";
import MessageReducer from "./MessageReducer";

const RootReducer = combineReducers({
  login: LoginReducer,
  project: ProjectReducer,
  dashboard: DashboardReducer,
  suite: TestSuiteReducer,
  testcase: TestCaseReducer,
  sequencer: TestSequencerReducer,
  message: MessageReducer
});

export default RootReducer;
