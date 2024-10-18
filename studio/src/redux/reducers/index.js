import { combineReducers } from "redux";
import LoginReducer from "./LoginReducer";
import ProjectReducer from "./ProjectReducer";
import DashboardReducer from "./DashboardReducer";
import TestScenarioReducer from "./TestScenarioReducer";
import TestCaseReducer from "./TestCaseReducer";
import TestSequencerReducer from "./TestSequencerReducer";
import AccountReducer from "./AccountReducer";
import TenantReducer from "./TenantReducer";
import TestPlanReducer from "./TestPlanReducer";

const RootReducer = combineReducers({
  login: LoginReducer,
  tenant: TenantReducer,
  account: AccountReducer,
  project: ProjectReducer,
  dashboard: DashboardReducer,
  testsuite: TestScenarioReducer,
  testcase: TestCaseReducer,
  testplan: TestPlanReducer,
  sequencer: TestSequencerReducer
});

export default RootReducer;
