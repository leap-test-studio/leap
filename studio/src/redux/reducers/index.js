import { combineReducers } from "redux";
import LoginReducer from "./LoginReducer";
import ProjectReducer from "./ProjectReducer";
import DashboardReducer from "./DashboardReducer";
import TestScenarioReducer from "./TestScenarioReducer";
import TestCaseReducer from "./TestCaseReducer";
import TestSequencerReducer from "./TestSequencerReducer";
import MessageReducer from "./MessageReducer";

const RootReducer = combineReducers({
  login: LoginReducer,
  project: ProjectReducer,
  dashboard: DashboardReducer,
  testscenario: TestScenarioReducer,
  testcase: TestCaseReducer,
  sequencer: TestSequencerReducer,
  message: MessageReducer
});

export default RootReducer;
