import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import IconButton from "../utilities/IconButton";
import Tooltip from "../utilities/Tooltip";
import PageHeader, { Page, PageActions, PageBody, PageTitle } from "./common/PageHeader";
import { fetchProjectBuilds, startProjectBuilds } from "../../redux/actions/ProjectActions";
import TableRenderer from "../tablerenderer";

const columns = [
  { title: "BuildNo", field: "buildNo", formatter: (field) => "B000" + field },
  { title: "Start Time", field: "startTime" },
  { title: "End Time", field: "endTime" },
  { title: "Total", field: "total" },
  { title: "Passed", field: "passed" },
  { title: "Failed", field: "failed" },
  { title: "Skipped", field: "skipped" },
  { title: "Running", field: "running" },
  {
    title: "Status",
    field: "status",
    enum: [
      { const: 0, title: "Draft" },
      { const: 1, title: "Running", class: "bg-purple-100 text-purple-800 animate-pulse" },
      { const: 2, title: "Pass", class: "bg-cds-green-0600 text-white" },
      { const: 3, title: "Failed", class: "bg-cds-red-0600 text-white" },
      { const: 4, title: "Unknown" },
      { const: 5, title: "Skip", class: "bg-yellow-300 text-white" },
      { const: 6, title: "Aborted", class: "bg-cds-red-0600 text-white" },
      { const: 999, title: "Invalid", class: "bg-cds-red-0600 text-white" }
    ]
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
            <IconButton title="Trigger" icon="PlayArrowRounded" onClick={() => dispatch(startProjectBuilds(project?.id))} />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <PageBody className="bg-white">
        <TableRenderer
          columns={columns}
          data={builds}
          pageSizes={[
            { value: 20, label: "20", default: true },
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
