import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { IconButton, TableRenderer } from "@utilities/.";
import { fetchProjectBuilds, startProjectBuilds } from "@redux-actions/.";

import { PageHeader, Page, PageActions, PageBody, PageTitle } from "./common/PageLayoutComponents";
import { POLLING_INTERVAL } from "../../Constants";

const columns = [
  { text: "Build #", dataField: "label", sort: true, center: true },
  {
    text: "Type",
    dataField: "type",
    enum: [
      { const: 0, title: "Project Build" },
      { const: 1, title: "Test Case Build" },
      { const: 2, title: "Test Suite Build" },
      { const: 3, title: "Workflow Build" }
    ],
    sort: true
  },
  { text: "Start Time", dataField: "startTime", sort: true, sortType: "date" },
  { text: "End Time", dataField: "endTime", sort: true, sortType: "date" },
  { text: "Total Runs", dataField: "total", width: 100, center: true },
  { text: "Passed", dataField: "passed", width: 100, center: true },
  { text: "Failed", dataField: "failed", sort: true, width: 100, center: true },
  { text: "Skipped", dataField: "skipped", width: 100, center: true },
  { text: "Running", dataField: "running", width: 100, center: true },
  {
    text: "Status",
    dataField: "status",
    enum: [
      { const: 0, title: "Draft" },
      { const: 1, title: "Running", class: "bg-purple-100 text-purple-800 animate-pulse" },
      { const: 2, title: "Pass", class: "bg-green-600 text-white" },
      { const: 3, title: "Failed", class: "bg-cds-red-0600 text-white" },
      { const: 4, title: "Unknown" },
      { const: 5, title: "Skip", class: "bg-yellow-300 text-white" },
      { const: 6, title: "Aborted", class: "bg-cds-red-0600 text-white" },
      { const: 999, title: "Invalid", class: "bg-cds-red-0600 text-white" }
    ],
    center: true,
    sort: true,
    width: 25
  },
  {
    text: "Flow Based",
    dataField: "flow",
    formatter: (field) => {
      if (field == null) return "Non Flow";
      return "Flow based";
    }
  }
];

let interval;
export default function TestRunner({ project, pageTitle }) {
  const dispatch = useDispatch();

  const fetchBuilds = useCallback(() => {
    if (project?.id) {
      dispatch(fetchProjectBuilds(project?.id));
    }
  }, [project?.id, dispatch, fetchProjectBuilds]);

  useEffect(() => {
    fetchBuilds();
    interval = setInterval(fetchBuilds, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const { builds } = useSelector((state) => state.project);
  return (
    <Page>
      <PageHeader>
        <PageTitle>{pageTitle}</PageTitle>
        <PageActions>
          <IconButton title="Trigger" icon="PlayArrow" onClick={() => dispatch(startProjectBuilds(project?.id))} tooltip="Start Automation Builds" />
        </PageActions>
      </PageHeader>
      <PageBody scrollable={false}>
        <TableRenderer columns={columns} data={builds} defaultSort="endTime" noDataIndication="No Runs" />
      </PageBody>
    </Page>
  );
}
