import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getRecentBuildSummary, getTotalStats } from "@redux-actions/.";

import RecentBuilds from "./dashboard/RecentBuilds";
import TotalCards from "./dashboard/TotalCards";
import MonthlyBuildStatus from "./dashboard/MonthlyBuildStatus";
import { PageHeader, Page, PageBody, PageTitle } from "./common/PageLayoutComponents";

const INTERVAL = 30 * 1000;

let timer = null;
function DashboardPage({ pageTitle, ...props }) {
  const dispatch = useDispatch();
  const { totalStats, recentBuildSummary, listLoading } = useSelector((state) => state.dashboard);

  const fetchReports = useCallback(() => {
    if (!listLoading) {
      dispatch(getRecentBuildSummary());
      dispatch(getTotalStats());
    }
  }, [listLoading]);

  useEffect(() => {
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
        <PageTitle>{pageTitle}</PageTitle>
      </PageHeader>
      <PageBody>
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
