import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";
import copy from "copy-to-clipboard";

import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, Spinner, Toast } from "@utilities/.";
import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";
import { createWorkflow, fetchWorkflowList, deleteWorkflow, resetWorkflowFlags, updateWorkflow, triggerSequence } from "@redux-actions/.";
import LocalStorageService from "@redux-actions/LocalStorageService";
import WebContext from "@WebContext";

import { PageHeader, Page, PageActions, PageBody, PageTitle, PageListCount } from "../common/PageLayoutComponents";
import CreateWorkflowDialog from "./CreateWorkflowDialog";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import FirstTimeCard from "../common/FirstTimeCard";
import ProgressIndicator from "../common/ProgressIndicator";
import FlowCanvas from "./flow_canvas";
import WorkflowSettingsDialog from "./WorkflowSettingsDialog";

dayjs.extend(relativeTime);

let intervalId;
const WorkflowManagement = (props) => {
  const dispatch = useDispatch();
  const UserInfo = LocalStorageService.getUserInfo();
  const { project, pageTitle } = props;
  const { showMessage, message, details, isFirstWorkflow, loading, workflows, listLoading } = useSelector((state) => state.workflow);
  const [search, setSearch] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const { getRole } = useContext(WebContext);
  const role = getRole();

  useEffect(() => {
    const searchText = search?.toLowerCase() || "";
    setFiltered(isEmpty(searchText) ? workflows : workflows.filter((s) => s.name.toLowerCase().includes(searchText)));
  }, [search, workflows]);

  const fetchList = useCallback(() => {
    if (!listLoading && !showEditor && !selectedWorkflow) dispatch(fetchWorkflowList(project?.id));
  }, [listLoading, showEditor, project, selectedWorkflow]);

  useEffect(() => {
    if (intervalId) clearInterval(intervalId);
    fetchList();
    intervalId = setInterval(fetchList, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (showMessage) {
      Swal.fire({
        title: message,
        icon: showMessage,
        text: details,
        width: 550,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetWorkflowFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const handleCreateWorkflow = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createWorkflow(project?.id, payload));
  };

  const openWorkflow = (wf) => {
    setSelectedWorkflow(wf);
    setShowEditor(true);
  };

  const openSettings = (wf) => {
    setSelectedWorkflow(wf);
    setSettingsDialog(true);
  };
  if (showEditor && selectedWorkflow)
    return (
      <FlowCanvas {...props} workflow={selectedWorkflow} pageTitle={"Workflow: " + selectedWorkflow?.name} onClose={() => setShowEditor(false)} />
    );

  return (
    <Page>
      <PageHeader show={!isFirstWorkflow}>
        <PageTitle>
          <PageListCount pageTitle={pageTitle} count={workflows.length} listLoading={listLoading} />
        </PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Workflow" show={loading} />
          <RoundedIconButton
            id="refresh-workflows"
            tooltip="Refresh Workflows"
            color="bg-color-0600 hover:bg-color-0500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent placeholder="Search for Workflow" onChange={setSearch} />
          <IconButton
            id="workflow-create-btn"
            title="Create"
            icon="AddCircle"
            onClick={() => setShowCreateDialog(true)}
            tooltip="Create New Workflow"
            disabled={!role.isLeads}
          />
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstWorkflow ? (
          <Centered>
            <FirstTimeCard
              id="first-time-workflow"
              icon="LibraryBooksTwoTone"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Workflow"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : listLoading && workflows.length == 0 ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : workflows && filtered.length > 0 ? (
          <div className="relative w-full">
            <CardHeaders
              items={[
                { colSpan: 5, label: "Workflow" },
                { colSpan: 4, label: "Info" },
                { colSpan: 1, label: "Status" },
                { colSpan: 2, label: "Actions" }
              ]}
            />
            <div className="grid grid-cols-1 gap-y-2.5 pr-0">
              {filtered.map((workflow, index) => (
                <WorkflowCard
                  {...props}
                  role={role}
                  key={index}
                  workflow={workflow}
                  openWorkflow={openWorkflow}
                  openSettings={openSettings}
                  activeUser={UserInfo}
                />
              ))}
            </div>
          </div>
        ) : (
          <Centered>
            <EmptyIconRenderer title="Workflow Not Found" />
            <IconButton id="workflow-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} tooltip="Fetch Workflows" />
          </Centered>
        )}

        <CreateWorkflowDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createWorkflow={handleCreateWorkflow} />
        <WorkflowSettingsDialog
          {...props}
          role={role}
          showDialog={showSettingsDialog}
          onClose={() => setSettingsDialog(false)}
          workflow={selectedWorkflow}
        />
      </PageBody>
    </Page>
  );
};

export default WorkflowManagement;

const WorkflowCard = ({ workflow, activeUser, openWorkflow, openSettings, role: { isLeads } = { isLeads: false } }) => {
  const dispatch = useDispatch();
  const { id, name, description, createdAt, updatedAt } = workflow;
  const status = true;

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Workflow?`,
      text: `Workflow Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: `${status ? "red" : "green"}`,
      cancelButtonColor: `${status ? "green" : "red"}`,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(
          updateWorkflow(id, {
            name,
            status: !status
          })
        );
      }
    });
  };

  const labels = [];

  if (createdAt?.length > 0) {
    labels.push({
      icon: "Event",
      tooltip: `Created on ${new Date(createdAt)?.toUTCString()}`,
      prefix: "Created on",
      element: dayjs(Number(new Date(createdAt).getTime())).fromNow()
    });
  }
  if (updatedAt?.length > 0) {
    labels.push({
      icon: "AccessTime",
      tooltip: `Modified on ${new Date(updatedAt)?.toUTCString()}`,
      prefix: "Modified on",
      element: dayjs(Number(new Date(updatedAt).getTime())).fromNow()
    });
  }

  const handleSettings = () => openSettings(workflow);

  const handleOpenWorkflow = () => openWorkflow(workflow);

  const handleDeleteWorkflow = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Workflow?",
      text: `Workflow: ${name}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: "red",
      cancelButtonColor: "green",
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(deleteWorkflow(id));
      }
    });
  };

  const handleStartExecution = () => dispatch(triggerSequence(id));

  const copyAsCurl = () => {
    copy(`curl '${window.location.origin}/api/v1/workflow/${id}/trigger' \
  -H 'Access-Control-Allow-Headers: Origin, Content-Type, Accept, Access-Control-Allow-Credentials, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Authorization, X-Requested-With, client-agent' \
  -H 'Authorization: Bearer ci' \
  -H 'Content-Type: application/json' \
  -X POST \
  --data-raw '{}'`);
    Toast.fire({
      icon: "success",
      title: "Copied cURL to Clipboard Successfully!"
    });
  };

  const moreOptions = [
    {
      icon: "Settings",
      label: "Settings",
      onClick: handleSettings,
      tooltip: "Workflow Settings",
      description: (
        <p>
          View and modify the <strong>Workflow Settings</strong>.
        </p>
      )
    },
    {
      icon: "Link",
      label: "Copy as cURL",
      onClick: copyAsCurl,
      tooltip: "Copy the start execution request for CI/CD"
    }
  ];
  if (id !== activeUser?.id) {
    moreOptions.push({
      icon: "Delete",
      label: "Delete",
      onClick: handleDeleteWorkflow,
      tooltip: "Delete Workflow",
      disabled: !isLeads,
      className: "group-hover:text-red-500",
      description: (
        <p>
          Permanently purges the <strong>Workflow</strong> from system.
        </p>
      )
    });
  }
  return (
    <DisplayCard
      id={id}
      name={name}
      description={description}
      status={status}
      moreOptions={moreOptions}
      actions={
        <div className="inline-flex items-center space-x-2">
          {id !== activeUser?.id && (
            <Tooltip
              title={
                <p>
                  Enable or Disable the <strong>Workflow</strong>
                </p>
              }
            >
              <TailwindToggleRenderer small={true} path={"status-" + id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
            </Tooltip>
          )}

          {status && <ActionButton icon="PlayArrow" onClick={handleStartExecution} tooltip="Start Execution of Workflow" />}

          <ActionButton
            icon="ModeEdit"
            onClick={handleOpenWorkflow}
            tooltip="Open Workflow"
            description={
              <p>
                View or modify the <strong>Workflow</strong>.
              </p>
            }
          />
        </div>
      }
      records={labels}
    />
  );
};
