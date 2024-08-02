import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import FirstTimeCard from "./FirstTimeCard";
import DisplayCard from "./DisplayCard";
import { ProjectColors } from "./Constants";
import CreateProjectDialog from "./CreateProjectDialog";
import ProjectSettingsDialog from "./ProjectSettingsDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "./PageLayoutComponents";

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

dayjs.extend(relativeTime);

const MAX_ALLOWED_PROJECTS = 25;

let intervalId;
const ProjectManagement = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, project, changeProject } = props;

  const { showMessage, message, details, isFirstProject, loading, openedProject, projects } = useSelector((state) => state.project);

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
        <PageTitle>My Projects</PageTitle>
        <PageActions>
          {loading && (
            <div className="flex mr-4">
              <svg aria-hidden="true" className="w-5 h-5 mt-1 mr-2 text-gray-200 animate-spin fill-green-600" viewBox="0 0 100 101" fill="none">
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <h3 className="text-green-600 font-bold animate-pulse">Creating Project..</h3>
            </div>
          )}
          <Tooltip title="Refresh Projects">
            <RoundedIconButton id="refresh-projects" color="bg-color-0900" size="18" icon="Refresh" handleClick={fetchProjectList} />
          </Tooltip>
          <SearchComponent search={search} placeholder="Search project name" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <Tooltip
            title={
              projects?.length > MAX_ALLOWED_PROJECTS ? (
                <p>
                  Maximum number projects allowed is <strong>{MAX_ALLOWED_PROJECTS}</strong>
                </p>
              ) : (
                "Create new project"
              )
            }
          >
            <IconButton
              id="project-create-btn"
              title="Create"
              icon="DashboardCustomize"
              disabled={projects?.length > MAX_ALLOWED_PROJECTS}
              onClick={() => setShowCreateDialog(true)}
            />
          </Tooltip>
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
                <div className="absoulte sticky top-0 grid grid-cols-12 w-full gap-x-2 bg-white px-4 py-2 rounded-lg border">
                  <div className="col-span-3 text-center border-r">Project</div>
                  <div className="col-span-5 text-center border-r">Info</div>
                  <div className="col-span-2 text-center border-r">Status</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
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
                <IconButton id="project-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} />
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
  const { id, name, description, status, createdAt, updatedAt, builds } = project;

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

  let labels = [
    {
      icon: "Fingerprint",
      tooltip: `Project ID ${id}`,
      prefix: "ID",
      element: id
    }
  ];

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

  return (
    <DisplayCard
      name={name}
      description={description}
      status={status}
      actions={
        <div className="flex flex-row items-center justify-end pr-1">
          {status && (
            <>
              {builds >= 1 ? (
                <IconRenderer
                  icon="Stop"
                  className="text-red-500 hover:text-red-600 mx-1 cursor-pointer animate-pulse"
                  onClick={() => {
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
                  }}
                  style={{ fontSize: 18 }}
                  tooltip="Stop All Running Builds"
                />
              ) : (
                <IconRenderer
                  icon="PlayArrow"
                  className="text-color-0600 hover:text-color-0500 mx-1 cursor-pointer"
                  onClick={() => {
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
                  }}
                  style={{ fontSize: 18 }}
                  tooltip="Start Automation Build"
                />
              )}
            </>
          )}
          <Tooltip
            title={
              <p>
                Enable or Disable the <strong>Project</strong>
              </p>
            }
          >
            <TailwindToggleRenderer small={true} path={id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
          </Tooltip>
          <IconRenderer
            icon="Settings"
            className="text-color-0600 hover:text-color-0500 mx-1 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={() =>
              handleAction({
                project,
                showSettingsDialog: true
              })
            }
            tooltip="Project Settings"
            description={
              <p>
                View and modify the <strong>Project Settings</strong>.
              </p>
            }
          />
          <IconRenderer
            icon="ModeEdit"
            className="text-color-0600 hover:text-color-0500 mx-1 cursor-pointer"
            onClick={selectProject}
            style={{ fontSize: 18 }}
            tooltip="Edit Project"
            description={
              <>
                View and modify the <strong>Project Test Scenarios</strong>.
                <br />
                <ul>
                  <li>Create/Delete/Enable/Diable Test scenario</li>
                  <li>Create/Delete/Enable/Diable Test cases</li>
                  <li>Define execution flow</li>
                </ul>
              </>
            }
          />
          <IconRenderer
            icon="Delete"
            className="text-color-0600 hover:text-cds-red-0800 mx-1 cursor-pointer"
            onClick={() => {
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
            }}
            style={{ fontSize: 18 }}
            tooltip="Delete Project"
            description={
              <p>
                Permanently purges the <strong>Project</strong> from system including all backups.
              </p>
            }
          />
          <IconRenderer
            icon="FileDownload"
            className="text-color-0600 hover:text-color-0500 mx-1 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={exportProject}
            tooltip="Export Project"
            description={
              <p>
                Export the <strong>Project</strong> in JSON format.
                <br />
                Filename: {`ProjectExport-${id}.json`}
              </p>
            }
          />
        </div>
      }
      records={labels}
      onClick={selectProject}
    />
  );
};
