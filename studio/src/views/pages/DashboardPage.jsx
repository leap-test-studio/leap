import React, { Fragment, useEffect } from "react";
import RecentBuilds from "./dashboard/RecentBuilds";
import TotalCards from "./dashboard/TotalCards";
import { useDispatch, useSelector } from "react-redux";
import { getRecentBuildSummary, getTotalStats, getBuildTrend } from "../../redux/actions/DashboardActions";
import MonthlyBuildStatus from "./dashboard/MonthlyBuildStatus";

const INTERVAL = 10 * 1000;

let timer = null;
function DashboardPage({ maxHeight }) {
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
    <div
      className="flex flex-col h-screen bg-slate-100 py-4 rounded mt-4"
      style={{
        minHeight: maxHeight,
        maxHeight: maxHeight
      }}
    >
      <TotalCards totalStats={totalStats} />
      <div className="mt-10 grid grid-cols-2 gap-4 mx-4">
        <RecentBuilds recentBuildSummary={recentBuildSummary} />
        <MonthlyBuildStatus buildStats={buildStats} />
      </div>
    </div>
  );
}

export default DashboardPage;
