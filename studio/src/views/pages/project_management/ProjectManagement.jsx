import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import CreateProjectDialog from "./CreateProjectDialog";
import ProjectSettingsDialog from "./ProjectSettingsDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";

import {
  createProject,
  fetchProjectList,
  deleteProject,
  resetProjectFlags,
  startProjectBuilds,
  stopProjectBuilds,
  updateProject,
  openProject
} from "../../../redux/actions/ProjectActions";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, IconRenderer } from "../../utilities";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import ProgressIndicator from "../common/ProgressIndicator";

dayjs.extend(relativeTime);

let intervalId;
const ProjectManagement = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, project, changeProject, pageTitle } = props;

  const { totalItems, showMessage, message, details, isFirstProject, loading, openedProject, projects } = useSelector((state) => state.project);

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);

  useEffect(() => {
    if (intervalId) clearInterval(intervalId);
    fetchList();
    intervalId = setInterval(fetchList, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (openedProject) {
      changeProject(openedProject);
    }
  }, [openedProject]);

  useEffect(() => {
    if (project) {
      setTimeout(() => {
        navigate(`/${product.page.base}/${product.page.landingPage}`, { replace: true });
      }, 30);
    }
  }, [project, navigate]);

  useEffect(() => {
    if (showMessage) {
      Swal.fire({
        title: message,
        icon: showMessage,
        text: details,
        width: 550
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetProjectFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const fetchList = () => dispatch(fetchProjectList());

  const handleProjectSelection = (s) => dispatch(openProject(s));

  const handleCreateProject = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createProject(payload));
  };

  const handleCardAction = (action) => {
    if (action) {
      setSelectedProject(action.project);

      if (action.showCreateDialog) {
        setShowCreateDialog(!showCreateDialog);
      } else if (action.showDeleteDialog) {
        setShowDeleteDialog(!showDeleteDialog);
      } else if (action.showCloneDialog) {
        setShowCloneDialog(!showCloneDialog);
      } else if (action.showSettingsDialog) {
        setSettingsDialog(!showSettingsDialog);
      }
    }
  };

  const filtered = projects.filter((s) => s.name.includes(search));

  return (
    <Page>
      <PageHeader show={!isFirstProject}>
        <PageTitle>{`${pageTitle} (${totalItems})`}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Project" show={loading} />
          <RoundedIconButton
            id="refresh-projects"
            tooltip="Refresh Projects"
            color="bg-color-0600 hover:bg-color-0500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent search={search} placeholder="Search for Project" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <IconButton
            id="project-create-btn"
            title="Create"
            icon="AddCircle"
            onClick={() => setShowCreateDialog(true)}
            tooltip="Create New Project"
          />
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstProject ? (
          <Centered>
            <FirstTimeCard
              id="first-time-project"
              icon="SnippetFolder"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Project"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {projects && filtered.length > 0 ? (
              <div className="relative w-full">
                <CardHeaders
                  items={[
                    { colSpan: 5, label: "Project" },
                    { colSpan: 4, label: "Info" },
                    { colSpan: 1, label: "Status" },
                    { colSpan: 2, label: "Actions" }
                  ]}
                />
                <div className="grid grid-cols-1 gap-y-2.5 pr-0">
                  {filtered.map((project, index) => (
                    <ProjectCard
                      key={index}
                      {...props}
                      project={project}
                      handleProjectSelection={handleProjectSelection}
                      handleAction={handleCardAction}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Project Not Found" />
                <IconButton id="project-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} tooltip="Fetch Projects" />
              </Centered>
            )}
          </>
        )}

        <CreateProjectDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createProject={handleCreateProject} />
        <ProjectSettingsDialog showDialog={showSettingsDialog} onClose={() => setSettingsDialog(false)} project={selectedProject} />
      </PageBody>
    </Page>
  );
};

export default ProjectManagement;

const ProjectCard = ({ project, handleProjectSelection, handleAction }) => {
  const dispatch = useDispatch();
  const { id, name, description, status, createdAt, updatedAt, builds, AccountId, updatedBy } = project;

  const selectProject = () => handleProjectSelection(name);

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Project?`,
      text: `Project Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: `${status ? "red" : "green"}`,
      cancelButtonColor: `${status ? "green" : "red"}`
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(
          updateProject(id, {
            name,
            status: !status
          })
        );
      }
    });
  };

  const exportProject = () => {
    axios.get(`/api/v1/project/${id}/export`).then((response) => {
      if (response.status === 200) {
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", `ProjectExport-${id}.json`);
        linkElement.click();
      }
    });
  };

  let labels = [];

  if (AccountId?.length > 0) {
    labels.push({
      icon: "AccountCircle",
      tooltip: `Created By ${AccountId}`,
      prefix: "Created By",
      element: AccountId
    });
  }

  if (createdAt?.length > 0) {
    labels.push({
      icon: "Event",
      tooltip: `Created on ${new Date(createdAt)?.toUTCString()}`,
      prefix: "Created on",
      element: dayjs(Number(new Date(createdAt).getTime())).fromNow()
    });
  }

  if (updatedBy?.length > 0) {
    labels.push({
      icon: "AccountCircle",
      tooltip: `Modified By ${updatedBy}`,
      prefix: "Last Modified By",
      element: updatedBy
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

  const projectSettings = () =>
    handleAction({
      project,
      showSettingsDialog: true
    });

  const handleDeleteProject = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Project?",
      text: `Project Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: "red",
      cancelButtonColor: "green"
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(deleteProject(id));
      }
    });
  };

  const handleStartExecution = () => {
    Swal.fire({
      title: "Start Project Execution?",
      text: `Project Id: ${id}`,
      icon: "question",
      confirmButtonText: "YES",
      showDenyButton: true
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(startProjectBuilds(id));
      }
    });
  };

  const handleStopExecution = () => {
    Swal.fire({
      title: "Stop Project Execution?",
      text: `Project Id: ${id}`,
      icon: "question",
      confirmButtonText: "YES",
      showDenyButton: true
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(stopProjectBuilds(id));
      }
    });
  };

  return (
    <DisplayCard
      id={id}
      name={name}
      description={description}
      status={status}
      moreOptions={[
        {
          icon: "Settings",
          label: "Settings",
          onClick: projectSettings,
          tooltip: "Project Settings",
          description: (
            <p>
              View and modify the <strong>Project Settings</strong>.
            </p>
          )
        },
        {
          icon: "Delete",
          label: "Delete",
          onClick: handleDeleteProject,
          tooltip: "Delete Test Project",
          description: (
            <p>
              Permanently purges the <strong>Project</strong> from system including all backups.
            </p>
          )
        },
        {
          icon: "FileDownload",
          label: "Export",
          onClick: exportProject,
          tooltip: "Export Project",
          description: (
            <p>
              Export the <strong>Project</strong> in JSON format.
              <br />
              Filename: {`ProjectExport-${id}.json`}
            </p>
          )
        }
      ]}
      actions={
        <>
          <Tooltip
            title={
              <p>
                Enable or Disable the <strong>Project</strong>
              </p>
            }
          >
            <TailwindToggleRenderer small={true} path={"status-" + id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
          </Tooltip>
          {status && (
            <>
              {builds >= 1 ? (
                <ActionButton
                  icon="Stop"
                  onClick={handleStopExecution}
                  tooltip="Stop Execution of Project Automation"
                  className="text-red-600 hover:text-red-500"
                />
              ) : (
                <ActionButton icon="PlayArrow" onClick={handleStartExecution} tooltip="Start Execution of Project Automation" />
              )}
            </>
          )}
          <ActionButton
            icon="ModeEdit"
            onClick={selectProject}
            tooltip="Edit Project"
            description={
              <>
                View and modify the <strong>Project</strong>.
                <br />
                <ul>
                  <li>Test Suite Operations</li>
                  <li>Test Cases Operations</li>
                  <li>Define Execution Flow</li>
                </ul>
              </>
            }
          />
        </>
      }
      records={labels}
      onClick={selectProject}
    />
  );
};
