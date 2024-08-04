import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { IconButton, Tooltip } from "../utilities";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "./common/PageLayoutComponents";
import { fetchProjectBuilds, startProjectBuilds } from "../../redux/actions/ProjectActions";
import TableRenderer from "../tablerenderer";

const columns = [
  { title: "Build #", field: "buildNo", formatter: (field) => String(field).padStart(4, "0"), sortable: true, center: true },
  {
    title: "Type",
    field: "type",
    enum: [
      { const: 0, title: "Project Build" },
      { const: 1, title: "Test Case Build" },
      { const: 2, title: "Test Suite Build" }
    ],
    sortable: true
  },
  { title: "Start Time", field: "startTime" },
  { title: "End Time", field: "endTime" },
  { title: "Total", field: "total", width: 25 },
  { title: "Passed", field: "passed", width: 25 },
  { title: "Failed", field: "failed", sortable: true, width: 25 },
  { title: "Skipped", field: "skipped", width: 25 },
  { title: "Running", field: "running", width: 25 },
  {
    title: "Status",
    field: "status",
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
    sortable: true,
    width: 25
  },
  {
    title: "Flow Based",
    field: "flow",
    formatter: (field) => {
      if (field == null) return "Non Flow";
      return "Flow based";
    }
  }
];

let interval;
export default function TestRunner({ project }) {
  const dispatch = useDispatch();

  const fetchBuilds = () => {
    if (project?.id) {
      dispatch(fetchProjectBuilds(project?.id));
    }
  };

  useEffect(() => {
    fetchBuilds();
    interval = setInterval(fetchBuilds, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const { builds } = useSelector((state) => state.project);

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Runner</PageTitle>
        <PageActions>
          <Tooltip title="Start Automation Builds">
            <IconButton title="Trigger" icon="PlayArrow" onClick={() => dispatch(startProjectBuilds(project?.id))} />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <PageBody scrollable={false}>
        <TableRenderer
          columns={columns}
          data={builds}
          pageSizes={[
            { value: 15, label: "15", default: true },
            { value: 20, label: "20" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
            { value: 150, label: "150" },
            { value: 200, label: "200" },
            { value: 300, label: "300" }
          ]}
        />
      </PageBody>
    </Page>
  );
}
