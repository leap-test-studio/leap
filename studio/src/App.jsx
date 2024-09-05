import { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import history from "./history";
import Layout from "./views/pages/layout/Layout";
import SignInPage from "./views/pages/SignInPage";
import ReactComponentLoader from "./views/pages/ReactComponentLoader";
import AuthGuard from "./auth/AuthGuard";
import WebContext from "./views/context/WebContext";
import { authRoles } from "./auth/authRoles";
import Product from "./product.json";

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
    title: "Projects",
    icon: "FolderSpecial",
    path: Product.page.projectsListPage,
    page: "project_management/ProjectManagement.jsx",
    projectSelectionRequired: false
  },
  {
    sideBar: true,
    title: "Accounts",
    icon: "GroupAdd",
    path: "account-management",
    page: "account_management/AccountManagement.jsx",
    projectSelectionRequired: false,
    access: authRoles.manager
  },
  {
    sideBar: true,
    title: "Tenants",
    icon: "CorporateFare",
    path: "tenant-management",
    page: "tenant_management/TenantManagement.jsx",
    projectSelectionRequired: false,
    access: authRoles.admin
  },
  {
    sideBar: true,
    title: "Test Suites",
    icon: "NextWeek",
    path: "test-suite",
    page: "testsuite/TestSuiteManagement.jsx",
    projectSelectionRequired: true
  },
  {
    sideBar: true,
    title: "Test Runs",
    icon: "CodeTwoTone",
    path: "test-runs",
    page: "TestRunner.jsx",
    projectSelectionRequired: true
  },
  {
    sideBar: true,
    title: "Test Plans",
    icon: "LibraryBooksTwoTone",
    path: "test-plan",
    page: "testplan_management/TestPlanManagement.jsx",
    projectSelectionRequired: true
  },
  {
    sideBar: true,
    title: "Test Reports",
    icon: "QueryStatsTwoTone",
    path: "test-reports",
    page: "TestReports.jsx",
    projectSelectionRequired: true
  }
];

export default function App(props) {
  const { product } = props;
  const context = useContext(WebContext);
  const { isProjectSelected } = context;
  const [routes, setRoutes] = useState(InititialRoutes);

  useEffect(() => {
    document.title = product.name + "-" + product.description;
    setRoutes(InititialRoutes.filter((r) => r.projectSelectionRequired == null || isProjectSelected === r.projectSelectionRequired));
  }, [isProjectSelected]);

  return (
    <Router basename="/" history={history}>
      <AuthGuard product={product} routes={routes}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={`${product.page.urlPrefix}/${route.path}`}
              element={
                route.page !== undefined ? (
                  <Layout
                    disableLayout={route.disableLayout}
                    base={`${product.page.urlPrefix}`}
                    sideBarItems={routes.filter((r) => r.sideBar === true || r.divider === true)}
                    {...props}
                    {...context}
                  >
                    {typeof route.page === "string" ? (
                      <ReactComponentLoader
                        key={`page-${index}`}
                        page={route.page}
                        pageTitle={route.title}
                        {...props}
                        {...context}
                        extras={route.extras}
                        access={route.access}
                      />
                    ) : (
                      <route.page key={`page-${index}`} pageTitle={route.title} {...props} {...context} access={route.access} />
                    )}
                  </Layout>
                ) : null
              }
            />
          ))}
          <Route exact path="/" element={<Navigate to={`${product.page.urlPrefix}/login`} />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}
