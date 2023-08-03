import React, { Fragment, useEffect } from "react";
import RecentBuilds from "./dashboard/RecentBuilds";
import TotalCards from "./dashboard/TotalCards";
import { useDispatch, useSelector } from "react-redux";
import { getRecentBuildSummary, getTotalStats, getBuildTrend } from "../../redux/actions/DashboardActions";
import MonthlyBuildStatus from "./dashboard/MonthlyBuildStatus";
import PageHeader, { PageTitle } from "./common/PageHeader";

const INTERVAL = 10 * 1000;

let timer = null;
function DashboardPage({ windowDimension }) {
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

  const minMaxHeight = windowDimension.maxContentHeight - 55;

  return (
    <>
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>
      <div
        className="w-full overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full my-2 shadow rounded border-2 bg-slate-100"
        style={{
          minHeight: minMaxHeight,
          maxHeight: minMaxHeight
        }}
      >
        <TotalCards totalStats={totalStats} />
        <div className="mt-10 grid grid-cols-2 gap-4 mx-4">
          <RecentBuilds recentBuildSummary={recentBuildSummary} />
          <MonthlyBuildStatus buildStats={buildStats} />
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
