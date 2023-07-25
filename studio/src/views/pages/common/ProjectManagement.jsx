import React from "react";
import IconButton from "../../utilities/IconButton";
import WebContext from "../../context/WebContext";
import ProjectSelectionDialog from "./ProjectSelectionDialog";
import {
  createProject,
  fetchProjectList,
  deleteProject,
  resetProjectFlags,
  startProjectBuilds,
  stopProjectBuilds,
  updateProject
} from "../../../redux/actions/ProjectActions";
import { connect, useDispatch } from "react-redux";
import { PropTypes } from "prop-types";
import { ProjectColors } from "./ProjectColors";
import CreateProjectDialog from "./CreateProjectDialog";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import CustomAlertDialog from "../../utilities/CustomAlertDialog";
import Centered from "../../utilities/Centered";
import Spinner from "../../utilities/Spinner";
import SearchComponent from "../../utilities/Search";
import IconRenderer from "../../IconRenderer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Tooltip from "../../utilities/Tooltip";
import { useNavigate } from "react-router-dom";
import EmptyIconRenderer from "../../utilities/EmptyIconRenderer";
import isEmpty from "lodash/isEmpty";
import Product from "../../../product.json";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";

dayjs.extend(relativeTime);

const MAX_ALLOWED_PROJECTS = 25;

class ProjectManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showProjectSelection: false,
      projectDialogMode: undefined,
      search: "",
      selectedProject: null,
      showCreateDialog: false,
      showDeleteDialog: false,
      showMessage: false,
      isError: false,
      message: "",
      loading: false
    };
    this.handleProjectDialogClose = this.handleProjectDialogClose.bind(this);
    this.handleSelectProjectClick = this.handleSelectProjectClick.bind(this);
    this.handleCloseProjectClick = this.handleCloseProjectClick.bind(this);
  }

  componentDidMount() {
    this.props.fetchProjectList();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { project } = nextProps;
    if (project.isProjectDeleted || project.isProjectCreated || project.isProjectUpdated) {
      nextProps.fetchProjectList();
      nextProps.resetProjectFlags();
    }
    if (project.isProjectDeleteFailed || project.isProjectCreateFailed || project.isProjectUpdateFailed) {
      nextProps.resetProjectFlags();
    }
    if (project.isProjectDeleted) {
      return {
        ...prevState,
        message: "Project deleted successfully",
        isError: false,
        showMessage: true
      };
    }
    if (project.isProjectCreated) {
      return {
        ...prevState,
        message: "Project created successfully",
        isError: false,
        showMessage: true,
        loading: project.loading
      };
    }
    if (project.isProjectCreateFailed) {
      return {
        ...prevState,
        message: "Failed to create project",
        isError: true,
        showMessage: true,
        loading: project.loading
      };
    }
    if (project.isProjectDeleteFailed) {
      return {
        ...prevState,
        message: "Failed to delete project",
        isError: true,
        showMessage: true
      };
    }
    return {
      ...prevState,
      loading: project.loading
    };
  }

  handleProjectDialogClose(project) {
    if (!isEmpty(project)) {
      this.context.changeProject(project);
    }

    this.setState({
      showProjectSelection: false
    });
  }

  handleCloseProjectClick() {
    this.setState({
      selectedProject: "",
      loaded: false
    });
    this.loadProjects();
  }

  handleSelectProjectClick(mode) {
    this.setState((prev) => ({
      showProjectSelection: !prev.showProjectSelection,
      projectDialogMode: prev.showProjectSelection ? undefined : mode
    }));
  }

  handleCreateProject(project) {
    this.props.createProject(project);
    this.setState({
      showCreateDialog: false
    });
  }

  handleDeleteProject(project) {
    const info = this.props.project?.projects?.find((p) => p.name === project);
    this.props.deleteProject(info.id);
    this.setState({
      selectedProject: null,
      showDeleteDialog: false
    });
  }

  render() {
    const {
      showProjectSelection,
      projectDialogMode,
      search,
      selectedProject,
      showDeleteDialog,
      showMessage,
      message,
      isError,
      showCreateDialog,
      loading
    } = this.state;
    const { projects, isFirstProject } = this.props.project;
    const filtered = projects?.filter((s) => s.name.includes(search));
    return (
      <>
        {!isFirstProject && (
          <div className="sticky top-0 p-2 pb-0 inline-flex items-center justify-between w-full">
            <span className="text-slate-500 text-xl select-none">Projects</span>
            <div className="inline-flex items-center justify-between">
              <SearchComponent
                search={search}
                placeholder="Search project name"
                onChange={(ev) => {
                  this.setState({
                    search: ev
                  });
                }}
                onClear={() => {
                  this.setState({
                    search: ""
                  });
                }}
              />
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
                placement="bottom"
              >
                <IconButton
                  title="Create"
                  icon="DashboardCustomize"
                  disabled={projects?.length > MAX_ALLOWED_PROJECTS}
                  onClick={() => {
                    this.setState({
                      showCreateDialog: true
                    });
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
        <div
          className="my-2 shadow rounded border-2 bg-slate-100"
          style={{
            minHeight: this.props.maxHeight - 30
          }}
        >
          {isFirstProject ? (
            <Centered>
              <FirstTime
                loading={loading}
                onClick={() => {
                  this.setState({
                    showCreateDialog: true
                  });
                }}
              />
            </Centered>
          ) : (
            <>
              {projects && filtered.length > 0 ? (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-3 p-5">
                  {filtered.map((project, index) => (
                    <ProjectCard
                      key={index}
                      {...project}
                      handleProjectDialogClose={this.handleProjectDialogClose}
                      handleAction={(info) => this.setState(info)}
                      startProjectBuilds={() => this.props.startProjectBuilds(project.id)}
                      stopProjectBuilds={() => this.props.stopProjectBuilds(project.id)}
                    />
                  ))}
                </div>
              ) : (
                <Centered>
                  <EmptyIconRenderer title="No records found" fill="#1e5194" />
                  <IconButton title="Refresh" icon="Refresh" onClick={() => this.props.fetchProjectList()} />
                </Centered>
              )}
            </>
          )}
        </div>
        {showProjectSelection && (
          <ProjectSelectionDialog
            mode={projectDialogMode}
            projects={projects}
            showDialog={showProjectSelection}
            closeDialog={this.handleProjectDialogClose}
            createProject={(s) => this.handleCreateProject(s)}
          />
        )}
        {selectedProject && (
          <DeleteItemDialog
            title="Delete Project"
            question="Are you sure you want to delete the selected project?"
            showDialog={showDeleteDialog}
            onClose={() =>
              this.setState({
                selectedProject: null,
                showDeleteDialog: false
              })
            }
            item={selectedProject}
            onDelete={() => this.handleDeleteProject(selectedProject)}
          />
        )}
        <CreateProjectDialog
          showDialog={showCreateDialog}
          onClose={() =>
            this.setState({
              showCreateDialog: false
            })
          }
          createProject={(s) => this.handleCreateProject(s)}
        />

        <CustomAlertDialog
          level={isError ? "warn" : "success"}
          message={message}
          showDialog={showMessage}
          onClose={() => {
            this.props.fetchProjectList();
            this.setState({ showMessage: false, message: "", isError: false });
            this.props.resetProjectFlags();
          }}
        />
      </>
    );
  }
}

ProjectManagement.contextType = WebContext;

const mapStateToProps = (state) => ({
  createProject: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  fetchProjectList: PropTypes.func.isRequired,
  resetProjectFlags: PropTypes.func.isRequired,
  startProjectBuilds: PropTypes.func.isRequired,
  stopProjectBuilds: PropTypes.func.isRequired,
  project: state.project
});

export default connect(mapStateToProps, {
  createProject,
  fetchProjectList,
  deleteProject,
  resetProjectFlags,
  startProjectBuilds,
  stopProjectBuilds
})(ProjectManagement);

function FirstTime({ loading, onClick }) {
  return (
    <>
      {loading ? (
        <Centered>
          <Spinner>Loading</Spinner>
        </Centered>
      ) : (
        <div className="bg-white h-fit shadow-sm w-96 rounded">
          <div className="flex flex-col items-center p-5">
            <IconRenderer icon="Extension" className="text-color-0500 animate-bounce mt-5" style={{ fontSize: "50" }} />
            <span className="my-4 text-center text-slate-800 uppercase text-xl select-none">Create first Project</span>
            <>
              <button
                className="text-sm items-center px-4 py-1 text-white rounded focus:outline-none shadow-sm hover:shadow-2xl bg-color-0800 hover:bg-color-0700"
                onClick={onClick}
              >
                Create
              </button>
            </>
          </div>
        </div>
      )}
    </>
  );
}

const ProjectCard = ({
  id,
  name,
  description,
  status,
  createdAt,
  updatedAt,
  handleProjectDialogClose,
  handleAction,
  startProjectBuilds,
  stopProjectBuilds,
  builds
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectProject = () => {
    handleProjectDialogClose(name);
    setTimeout(() => {
      navigate(Product.page?.base + "/dashboard", { replace: true });
    }, 10);
  };

  const handleToggle = () => {
    dispatch(
      updateProject(id, {
        name,
        status: !status
      })
    );
  };

  return (
    <div key={name} className="bg-white shadow border hover:shadow-2xl rounded-md">
      <div className="flex flex-row rounded-tr rounded-tl">
        <div className="flex flex-col w-3/12 items-center justify-start p-2">
          <div
            className="relative w-12 h-12 m-3 mb-1.5 rounded-full flex justify-center shadow-lg hover:shadow-inner items-center bg-opacity-70 text-center select-none text-white font-medium"
            style={{ backgroundColor: ProjectColors[name.charAt(0).toLowerCase()] }}
            onClick={selectProject}
          >
            {name.charAt(0).toUpperCase() + name.charAt(name.length - 1).toUpperCase()}
          </div>
          <p className={`text-slate-500 text-xs break-words select-all rounded px-1 ${status ? "bg-green-200" : "bg-slate-200"}`}>
            {status ? "Active" : "In-Active"}
          </p>
        </div>
        <div className="flex flex-col w-9/12 text-left py-3">
          <div className="flex flex-row -mt-3 mb-2 p-2 items-center justify-end">
            {status && (
              <>
                {builds >= 1 ? (
                  <Tooltip title="Stop All Running Builds">
                    <IconRenderer
                      icon="Stop"
                      className="text-red-500 hover:text-red-600 mx-1 cursor-pointer animate-pulse"
                      onClick={() => stopProjectBuilds(id)}
                      fontSize="small"
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Start Automation Builds">
                    <IconRenderer
                      icon="PlayArrowRounded"
                      className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
                      onClick={() => startProjectBuilds(id)}
                      fontSize="small"
                    />
                  </Tooltip>
                )}
              </>
            )}
            <TailwindToggleRenderer path={id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
            <Tooltip
              title="Edit Project"
              content={
                <p>
                  View and modify the <strong>Project</strong> details.
                  <br />
                  Create network elements, deploy, Simulate and more
                </p>
              }
            >
              <IconRenderer
                icon="ModeEditOutlineOutlined"
                className="text-color-0500 hover:text-cds-blue-0500 mx-1 cursor-pointer"
                onClick={selectProject}
                fontSize="small"
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
                icon="DeleteOutlineTwoTone"
                className="text-color-0500 hover:text-cds-red-0600 mx-1 cursor-pointer"
                onClick={() =>
                  handleAction({
                    selectedProject: name,
                    showDeleteDialog: true
                  })
                }
                fontSize="small"
              />
            </Tooltip>
          </div>
          <div className="text-slate-600 text-sm font-medium break-words pb-1 -mt-4">{name}</div>
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
        </div>
      </div>
    </div>
  );
};
