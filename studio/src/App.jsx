import history from "./history";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layout from "./views/pages/layout/Layout";
import SignInPage from "./views/pages/SignInPage";
import ReactComponentLoader from "./views/pages/ReactComponentLoader";
import AuthGuard from "./auth/AuthGuard";
import WebContext from "./views/context/WebContext";
import { useContext, useEffect, useState } from "react";

const InititialRoutes = [
  {
    path: "login",
    page: SignInPage,
    disableLayout: true
  },
  {
    sideBar: true,
    title: "Dashboard",
    icon: "Speed",
    path: "dashboard",
    page: "DashboardPage.jsx"
  },
  {
    sideBar: true,
    title: "My Projects",
    icon: "FolderSpecial",
    path: "my-projects",
    page: "common/ProjectManagement.jsx",
    projectSelectionRequired: false
  },
  {
    sideBar: true,
    title: "Test Management",
    icon: "Apps",
    path: "test-management",
    page: "testsuite/TestSuiteManagement.jsx",
    projectSelectionRequired: true
  },
  {
    sideBar: true,
    title: "Test Runner",
    icon: "ElectricBoltTwoTone",
    path: "test-runner",
    page: "TestRunner.jsx"
  },
  {
    sideBar: true,
    title: "Test Reports",
    icon: "QueryStatsTwoTone",
    path: "test-reports",
    page: "TestReports.jsx"
  },
  {
    sideBar: true,
    title: "Test Case Sequencer",
    icon: "AccountTreeTwoTone",
    path: "test-sequencer",
    page: "sequencer/index.jsx",
    projectSelectionRequired: true
  }
];

export default function App(props) {
  const { product } = props;
  const context = useContext(WebContext);
  const { isProjectSelected } = context;
  const [routes, setRoutes] = useState(InititialRoutes);

  useEffect(() => {
    setRoutes(InititialRoutes.filter((r) => r.projectSelectionRequired == null || isProjectSelected === r.projectSelectionRequired));
  }, [isProjectSelected]);

  return (
    <Router basename="/" history={history}>
      <AuthGuard product={product} routes={routes}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={`/${product?.page.base}/${route.path}`}
              element={
                route.page !== undefined ? (
                  <Layout
                    disableLayout={route.disableLayout}
                    base={`/${product?.page.base}`}
                    sideBarItems={routes.filter((r) => r.sideBar === true || r.divider === true)}
                    {...props}
                    {...context}
                  >
                    {typeof route.page === "string" ? (
                      <ReactComponentLoader key={`page-${index}`} page={route.page} {...props} {...context} extras={route.extras} />
                    ) : (
                      <route.page key={`page-${index}`} {...props} {...context} />
                    )}
                  </Layout>
                ) : null
              }
            />
          ))}
          <Route exact path="/" element={<Navigate to={`/${product?.page.base}/login`} />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}
