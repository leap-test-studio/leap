import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import IconButton from "../../utilities/IconButton";
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
import { ProjectColors } from "./ProjectColors";
import CreateProjectDialog from "./CreateProjectDialog";
import ProjectSettingsDialog from "./ProjectSettingsDialog";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import CustomAlertDialog from "../../utilities/CustomAlertDialog";
import Centered from "../../utilities/Centered";
import SearchComponent from "../../utilities/SearchComponent";
import IconRenderer from "../../IconRenderer";
import Tooltip from "../../utilities/Tooltip";
import EmptyIconRenderer from "../../utilities/EmptyIconRenderer";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "./PageLayoutComponents";
import RoundedIconButton from "../../utilities/RoundedIconButton";
import FirstTimeCard from "./FirstTimeCard";
import DisplayCard from "./DisplayCard";

dayjs.extend(relativeTime);

const MAX_ALLOWED_PROJECTS = 25;

let intervalId;
const ProjectManagement = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, project, changeProject } = props;

  const { showMessage, isError, message, isFirstProject, loading, openedProject, projects } = useSelector((state) => state.project);

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

  const fetchList = () => dispatch(fetchProjectList());

  const handleProjectSelection = (s) => dispatch(openProject(s));

  const handleCreateProject = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createProject(payload));
  };

  const handleDeleteProject = () => {
    setShowDeleteDialog(!showDeleteDialog);
    dispatch(deleteProject(selectedProject?.id));
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
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-5 p-2 pr-0">
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
            ) : (
              <Centered>
                <EmptyIconRenderer title="Project Not Found" />
                <IconButton id="project-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} />
              </Centered>
            )}
          </>
        )}
        {selectedProject && (
          <DeleteItemDialog
            title="Delete Project"
            question="Are you sure you want to delete the selected project?"
            showDialog={showDeleteDialog}
            onClose={() => {
              setSelectedProject(null);
              setShowDeleteDialog(false);
            }}
            item={selectedProject?.name}
            onDelete={handleDeleteProject}
          />
        )}
        <CreateProjectDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createProject={handleCreateProject} />
        <ProjectSettingsDialog showDialog={showSettingsDialog} onClose={() => setSettingsDialog(false)} project={selectedProject} />
        <CustomAlertDialog
          level={isError ? "warn" : "success"}
          message={message}
          showDialog={showMessage}
          onClose={() => {
            dispatch(resetProjectFlags());
            fetchList();
          }}
        />
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
    dispatch(
      updateProject(id, {
        name,
        status: !status
      })
    );
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

  return (
    <DisplayCard
      name={name}
      cardIcon={
        <>
          <div
            className="relative w-12 h-12 m-3 mb-1.5 rounded-full flex justify-center shadow-lg hover:shadow-inner items-center bg-opacity-70 text-center select-none text-white font-medium"
            style={{ backgroundColor: ProjectColors[name.charAt(0).toLowerCase()] }}
            onClick={selectProject}
          >
            {name.charAt(0).toUpperCase() + name.charAt(name.length - 1).toUpperCase()}
          </div>
          <div
            className={`text-slate-500 text-[10px] text-center font-bold mt-0.5 mb-2 px-2 py-0.5 rounded shadow ${
              status ? "bg-green-200" : "bg-blue-200"
            }`}
          >
            {status ? "Active" : "In-Active"}
          </div>
        </>
      }
      actions={
        <div className="flex flex-row items-center justify-end pr-1">
          {status && (
            <>
              {builds >= 1 ? (
                <Tooltip title="Stop All Running Builds">
                  <IconRenderer
                    icon="Stop"
                    className="text-red-500 hover:text-red-600 mx-1 cursor-pointer animate-pulse"
                    onClick={() => dispatch(stopProjectBuilds(id))}
                    style={{ fontSize: 18 }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Start Automation Build">
                  <IconRenderer
                    icon="PlayArrow"
                    className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
                    onClick={() => dispatch(startProjectBuilds(id))}
                    style={{ fontSize: 18 }}
                  />
                </Tooltip>
              )}
            </>
          )}
          <TailwindToggleRenderer small={true} path={id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
          <Tooltip
            title="Project Settings"
            content={
              <p>
                View and modify the <strong>Project Settings</strong>.
              </p>
            }
          >
            <IconRenderer
              icon="Settings"
              className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
              style={{ fontSize: 18 }}
              onClick={() =>
                handleAction({
                  project,
                  showSettingsDialog: true
                })
              }
            />
          </Tooltip>
          <Tooltip
            title="Edit Project"
            content={
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
          >
            <IconRenderer
              icon="ModeEditOutline"
              className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
              onClick={selectProject}
              style={{ fontSize: 18 }}
            />
          </Tooltip>
          <Tooltip
            title="Delete Project"
            content={
              <p>
                Permanently purges the <strong>Project</strong> from system including all backups.
              </p>
            }
          >
            <IconRenderer
              icon="Delete"
              className="text-color-0500 hover:text-cds-red-0600 mx-1 cursor-pointer"
              onClick={() =>
                handleAction({
                  project,
                  showDeleteDialog: true
                })
              }
              style={{ fontSize: 18 }}
            />
          </Tooltip>

          <Tooltip
            title="Export Project"
            content={
              <p>
                Export the <strong>Project</strong> in JSON format.
                <br />
                Filename: {`ProjectExport-${id}.json`}
              </p>
            }
          >
            <IconRenderer
              icon="FileDownload"
              className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
              style={{ fontSize: 18 }}
              onClick={exportProject}
            />
          </Tooltip>
        </div>
      }
    >
      {createdAt?.length > 0 && (
        <div className="text-slate-500 text-xs break-words select-all flex flex-row items-center">
          <IconRenderer icon="Event" fontSize="10" className="text-color-0600 pr-0.5" />
          <Tooltip title={`Created on ${new Date(createdAt)?.toUTCString()}`} placement="bottom">
            {`Created on  - ${dayjs(Number(new Date(createdAt).getTime())).fromNow()}`}
          </Tooltip>
        </div>
      )}
      {updatedAt?.length > 0 && (
        <div className="text-slate-500 text-xs break-words select-all flex flex-row items-center">
          <IconRenderer icon="AccessTime" fontSize="10" className="text-color-0600 pr-0.5" />
          <Tooltip title={`Last Modified on ${new Date(updatedAt).toUTCString()}`} placement="bottom">
            {`Modified on - ${dayjs(new Date(updatedAt).getTime()).fromNow()}`}
          </Tooltip>
        </div>
      )}
      {description?.length > 0 && (
        <div className="text-slate-500 text-xs break-words pr-2 select-all">
          <IconRenderer icon="Description" fontSize="10" className="text-color-0600 pr-0.5" />
          {`Description - ${description}`}
        </div>
      )}
    </DisplayCard>
  );
};
