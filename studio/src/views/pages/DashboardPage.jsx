import React, { useEffect } from "react";
import RecentBuilds from "./dashboard/RecentBuilds";
import TotalCards from "./dashboard/TotalCards";
import { useDispatch, useSelector } from "react-redux";
import { getRecentBuildSummary, getTotalStats, getBuildTrend } from "../../redux/actions/DashboardActions";
import MonthlyBuildStatus from "./dashboard/MonthlyBuildStatus";
import PageHeader, { Page, PageBody, PageTitle } from "./common/PageHeader";

const INTERVAL = 10 * 1000;

let timer = null;
function DashboardPage() {
  const dispatch = useDispatch();
  const { totalStats, recentBuildSummary, buildStats } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const fetchReports = () => {
      dispatch(getRecentBuildSummary());
      dispatch(getTotalStats());
      dispatch(getBuildTrend());
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
      <PageBody>
        <TotalCards totalStats={totalStats} />
        <div className="mt-10 grid grid-cols-2 gap-4 mx-4">
          <RecentBuilds recentBuildSummary={recentBuildSummary} />
          <MonthlyBuildStatus buildStats={buildStats} />
        </div>
      </PageBody>
    </Page>
  );
}

export default DashboardPage;
