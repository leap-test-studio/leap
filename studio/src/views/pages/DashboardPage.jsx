import React, { useEffect } from "react";
import RecentBuilds from "./dashboard/RecentBuilds";
import TotalCards from "./dashboard/TotalCards";
import { useDispatch, useSelector } from "react-redux";
import { getRecentBuildSummary, getTotalStats } from "../../redux/actions/DashboardActions";
import MonthlyBuildStatus from "./dashboard/MonthlyBuildStatus";
import PageHeader, { Page, PageBody, PageTitle } from "./common/PageHeader";

const INTERVAL = 10 * 1000;

let timer = null;
function DashboardPage(props) {
  const dispatch = useDispatch();
  const { totalStats, recentBuildSummary } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const fetchReports = () => {
      dispatch(getRecentBuildSummary());
      dispatch(getTotalStats());
    };
    fetchReports();
    timer = setInterval(() => {
      fetchReports();
    }, INTERVAL);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>
      <PageBody className="bg-slate-100">
        <TotalCards totalStats={totalStats} {...props} />
        <div className="my-5 grid grid-cols-1 gap-5 ml-2">
          <RecentBuilds recentBuildSummary={recentBuildSummary} {...props} />
          <MonthlyBuildStatus {...props} />
        </div>
      </PageBody>
    </Page>
  );
}

export default DashboardPage;
