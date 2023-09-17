import React from "react";
import { Dialog } from "@headlessui/react";
import Spinner from "../../utilities/Spinner";
import IconRenderer from "../../IconRenderer";
import Centered from "../../utilities/Centered";
import isEmpty from "lodash/isEmpty";

class ProjectSelectionDialog extends React.PureComponent {
  closeButtonReference = React.createRef(null);
  hiddenFileInput = React.createRef(null);
  constructor(props) {
    super(props);
    this.state = {
      projectName: "",
      selectedProject: "",
      errored: "",
      selectedFile: null,
      creating: false,
      percent: 0
    };
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.handleProjectSelect = this.handleProjectSelect.bind(this);
    this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
    this.handleSelectFileClick = this.handleSelectFileClick.bind(this);
    this.handleHiddenInputChange = this.handleHiddenInputChange.bind(this);
    this.handleClearErrorClick = this.handleClearErrorClick.bind(this);
    this.handleCancelDialog = this.handleCancelDialog.bind(this);
    this.handleProjectSelected = this.handleProjectSelected.bind(this);
  }

  showErrorMessage(msg) {
    this.setState({
      errored: msg,
      percent: 0
    });
    let timerId = setInterval(() => {
      this.setState({
        errored: "",
        percent: 0
      });
      clearInterval(timerId);
    }, 5000);
  }

  async createProject(name) {
    if (isEmpty(name)) {
      this.showErrorMessage("Project name cannot be empty, Please try again.");
      return "";
    }
    if (!/^(\w+\.?)*\w+$/.test(name)) {
      this.showErrorMessage("You can use upper and lowercase letters, numbers, “.” (dot), and “_” (underscore) symbols.");
      return "";
    }
    try {
      this.props.createProject(name);
      return name;
    } catch (e) {
      this.showErrorMessage("Failure occured while creating the project, Please try again.");
      return "";
    }
  }

  handleClearErrorClick(ev) {
    ev.preventDefault();
    this.setState({
      errored: ""
    });
  }

  handleCloseDialog() {
    const { mode } = this.props;
    if (mode === "select") {
      let { selectedProject } = this.state;
      this.props.closeDialog(selectedProject);
    }
    if (mode === "create") {
      let { projectName } = this.state;
      this.setState({
        creating: true
      });
      this.createProject(projectName).then((name) => {
        if (!isEmpty(name)) {
          this.props.closeDialog(name);
        } else {
          this.setState({
            creating: false
          });
        }
      });
    }
  }

  handleCancelDialog() {
    this.props.closeDialog("");
  }

  handleHiddenInputChange(ev) {
    if (ev?.target?.files && Array.isArray(ev.target.files) && ev.target.files.length > 0) {
      this.setState({
        selectedFile: ev.target.files[0]
      });
    }
  }

  handleSelectFileClick() {
    this.hiddenFileInput.current.click();
  }

  handleProjectSelected(project) {
    if (!isEmpty(project)) {
      this.setState({
        selectedProject: project
      });
    }
  }

  handleProjectSelect(ev) {
    if (ev?.target?.value) {
      this.setState({
        selectedProject: ev.target.value
      });
    }
  }

  handleProjectNameChange(ev) {
    if (ev?.target?.value) {
      this.setState({
        projectName: ev.target.value
      });
    }
  }

  renderSelect() {
    let { projects } = this.props;
    let { selectedProject } = this.state;
    return (
      <React.Fragment>
        <div className="rounded border-none py-2">
          <label htmlFor="project-name" className="block text-xs font-medium text-slate-500">
            Project Name
          </label>
          <div className="flex flex-row mt-1 items-center h-10">
            <select
              value={selectedProject}
              onChange={this.handleProjectSelect}
              className="font-mono text-slate-700 block w-full mt-1 rounded-md border-slate-500 shadow-md focus:outline-none focus:ring-1 ring-slate-500 focus:ring-slate-500"
            >
              <option className="font-mono" value="" disabled>
                Please Choose
              </option>
              {projects.map((item, index) => (
                <option className="font-mono" key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </React.Fragment>
    );
  }

  renderCreate() {
    const { creating } = this.state;
    return (
      <React.Fragment>
        {creating ? (
          <Centered>
            <div className="p-4">
              <Spinner>Creating</Spinner>
            </div>
          </Centered>
        ) : (
          <div className="rounded border-none py-2">
            <label htmlFor="project-name" className="block text-xs font-medium text-slate-500">
              Project Name
            </label>
            <div className="flex flex-row mt-1 items-center h-10">
              <input
                type="text"
                name="project-name"
                id="project-name"
                autoComplete="off"
                onChange={this.handleProjectNameChange}
                className="caret-slate-300 text-slate-700 block w-full rounded-md border-slate-500 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }

  renderMode() {
    const { mode } = this.props;
    return <React.Fragment>{mode === "select" ? this.renderSelect() : mode === "create" ? this.renderCreate() : null}</React.Fragment>;
  }

  render() {
    const { mode } = this.props;
    const { errored, selectedProject, projectName, creating } = this.state;
    let activeButtonClasses = "flex items-center px-5 py-1 rounded focus:outline-none shadow-sm bg-color-0800 uppercase";
    let inactiveButtonClasses =
      "flex items-center px-5 py-1 rounded focus:outline-none ring-1 ring-slate-400 shadow-sm text-slate-400 bg-slate-100 uppercase";
    let buttonActive = false;

    if (mode === "select") {
      if (!isEmpty(selectedProject)) {
        buttonActive = true;
      }
    }
    if (mode === "create") {
      if (!isEmpty(projectName)) {
        if (!creating) {
          buttonActive = true;
        }
      }
    }

    return (
      <React.Fragment>
        <Dialog
          initialFocus={this.closeButtonReference}
          open={this.props.showDialog}
          onClose={() => null}
          as="div"
          className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto"
        >
          <Dialog.Overlay className="fixed inset-0 bg-slate-400 opacity-30" />
          <div className="flex flex-col pt-4 pb-4 px-4 bg-cds-white rounded shadow-lg z-50 min-w-0.25">
            <div className="group flex flex-row justify-between items-center">
              <Dialog.Title className="text-color-0700 font-medium text-lg tracking-wide group-hover:text-cds-blue-0300">
                Create a Project
              </Dialog.Title>
              <button onClick={this.handleCancelDialog} className="text-color-0700 group-hover:text-cds-blue-0300 focus:outline-none">
                <IconRenderer icon="Close" className="h-6 w-6" />
              </button>
            </div>
            <Dialog.Description as="div" className="text-slate-700">
              {!isEmpty(errored) && (
                <div className="py-4">
                  <div className="px-4 py-2 rounded bg-cds-red-0700 text-cds-white flex flex-row justify-between items-center">
                    <p className="text-cds-white font-medium">{errored}</p>
                    <button
                      onClick={this.handleClearErrorClick}
                      className="ml-2 bg-transparent text-xl font-semibold outline-none focus:outline-none"
                    >
                      <span>×</span>
                    </button>
                  </div>
                </div>
              )}
              <>{this.renderMode()}</>
            </Dialog.Description>
            <div className="flex justify-end text-cds-white mt-2">
              <button
                disabled={!buttonActive}
                onClick={this.handleCloseDialog}
                ref={this.closeButtonReference}
                className={buttonActive ? activeButtonClasses : inactiveButtonClasses}
              >
                <span className="leading-normal"> {mode} </span>
              </button>
            </div>
          </div>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ProjectSelectionDialog;
