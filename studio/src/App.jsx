import { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import history from "./history";
import Layout from "./views/pages/layout/Layout";
import SignInPage from "./views/pages/SignInPage";
import ReactComponentLoader from "./views/pages/ReactComponentLoader";
import AuthGuard from "./auth/AuthGuard";
import WebContext from "./views/context/WebContext";
import { authRoles } from "./auth/authRoles";
import { LoginCallback } from "@okta/okta-react";
import { Centered, Spinner } from "./views/utilities";
import PageNotFound from "./views/pages/common/PageNotFound";
import DashboardPage from "./views/pages/DashboardPage";
import ProjectManagement from "./views/pages/project_management/ProjectManagement";
import AccountManagement from "./views/pages/account_management/AccountManagement";
import TenantManagement from "./views/pages/tenant_management/TenantManagement";
import TestSuiteManagement from "./views/pages/testsuite/TestSuiteManagement";
import TestRunner from "./views/pages/TestRunner";
import TestPlanManagement from "./views/pages/testplan_management/TestPlanManagement";
import TestReports from "./views/pages/TestReports";
import SeleniumGridView from "./views/pages/SeleniumGridView";

export default function App(props) {
  const { product } = props;
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
      page: DashboardPage
    },
    {
      sideBar: true,
      title: "Projects",
      icon: "FolderSpecial",
      path: product.page.projectsListPage.replace("/", ""),
      page: ProjectManagement,
      projectSelectionRequired: false
    },
    {
      sideBar: true,
      title: "Accounts",
      icon: "GroupAdd",
      path: "account-management",
      page: AccountManagement,
      projectSelectionRequired: false,
      access: authRoles.manager
    },
    {
      sideBar: true,
      title: "Tenants",
      icon: "CorporateFare",
      path: "tenant-management",
      page: TenantManagement,
      projectSelectionRequired: false,
      access: authRoles.admin
    },
    {
      sideBar: true,
      title: "Test Suites",
      icon: "NextWeek",
      path: "test-suite",
      page: TestSuiteManagement,
      projectSelectionRequired: true
    },
    {
      sideBar: true,
      title: "Test Runs",
      icon: "CodeTwoTone",
      path: "test-runs",
      page: TestRunner,
      projectSelectionRequired: true
    },
    {
      sideBar: true,
      title: "Test Plans",
      icon: "LibraryBooksTwoTone",
      path: "test-plans",
      page: TestPlanManagement,
      projectSelectionRequired: true
    },
    {
      sideBar: true,
      title: "Test Reports",
      icon: "QueryStatsTwoTone",
      path: "test-reports",
      page: TestReports,
      projectSelectionRequired: true
    },
    {
      sideBar: true,
      title: "Selenium Grid",
      icon: "GridOnTwoTone",
      path: "selenium-grid",
      page: SeleniumGridView
    }
  ];
  const context = useContext(WebContext);
  const { isProjectSelected } = context;
  const [routes, setRoutes] = useState(InititialRoutes);

  useEffect(() => {
    document.title = product.name + "-" + product.description;
    setRoutes(InititialRoutes.filter((r) => r.projectSelectionRequired == null || isProjectSelected === r.projectSelectionRequired));
  }, [isProjectSelected]);

  return (
    <Router basename="/" history={history}>
      <AuthGuard product={product}>
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={`${product.page.urlPrefix}/${route.path}`}
              element={
                route.page !== undefined ? (
                  <Layout
                    disableLayout={route.disableLayout}
                    sideBarItems={routes.filter((r) => r.sideBar === true || r.divider === true)}
                    base={product.page.urlPrefix}
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
          <Route
            path={`${product.page.urlPrefix}/callback`}
            element={
              <LoginCallback
                loadingElement={
                  <Centered>
                    <Spinner />
                  </Centered>
                }
              />
            }
          />
          <Route exact path="/" element={<Navigate to={`${product.page.urlPrefix}/login`} />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
}
