import React from "react";
import WebContext from "../context/WebContext";
import IconRenderer from "../IconRenderer";
import Spinner from "../utilities/Spinner";
import { upload } from "../utilities/http";
import Centered from "../utilities/Centered";
import isEmpty from "lodash/isEmpty";

class SettingsPage extends React.Component {
  hiddenFileInput = React.createRef(null);
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: undefined,
      uploading: false,
      errored: "",
      percent: 0
    };
    this.handleHiddenInputChange = this.handleHiddenInputChange.bind(this);
    this.handleUploadClick = this.handleUploadClick.bind(this);
    this.handleClearErrorClick = this.handleClearErrorClick.bind(this);
  }

  showErrorMessage(msg) {
    this.setState({
      errored: msg,
      uploading: false,
      percent: 0
    });
    let timerId = setInterval(() => {
      this.setState({
        errored: ""
      });
      clearInterval(timerId);
    }, 10000);
  }

  async uploadProject(file) {
    if (isEmpty(file)) {
      this.showErrorMessage("File must be selected, Please try again.");
      return "";
    }
    this.setState({
      uploading: true
    });
    try {
      const data = new FormData();
      data.append("upload-file", file);
      let response = await upload("POST", "/api/upload/default", data, (percent) =>
        this.setState({
          percent: Math.floor(percent)
        })
      );
      if (response.status === 200) {
        return await response.text();
      } else {
        this.showErrorMessage("Failure occured while uploading the project, Please try again.");
        return "";
      }
    } catch (e) {
      this.showErrorMessage("Failure occured while uploading the project, Please try again.");
      return "";
    }
  }

  handleClearErrorClick(ev) {
    ev.preventDefault();
    this.setState({
      errored: ""
    });
  }

  handleHiddenInputChange(ev) {
    if (!isEmpty(ev?.target)) {
      if (Array.isArray(ev.target.files) && ev.target.files.length > 0) {
        const file = ev.target.files[0];
        this.setState({
          selectedFile: file
        });
        this.uploadProject(file).then(() => {
          this.setState({
            uploading: false,
            percent: 0
          });
        });
      }
    }
  }

  handleUploadClick() {
    this.hiddenFileInput.current.click();
  }

  render() {
    const { uploading, errored, percent } = this.state;
    return (
      <React.Fragment>
        <div className="container h-full p-4">
          {!isEmpty(errored) && (
            <div className="py-4">
              <div className="px-4 py-2 rounded bg-cds-red-0700 text-cds-white flex flex-row justify-between items-center">
                <p className="text-cds-white font-medium">{errored}</p>
                <button onClick={this.handleClearErrorClick} className="ml-2 bg-transparent text-2xl font-semibold outline-none focus:outline-none">
                  <span>×</span>
                </button>
              </div>
            </div>
          )}
          <div className="shadow rounded p-4 flex flex-row justify-between">
            {uploading ? (
              <div className="w-full flex flex-row justify-center items-center">
                <Centered>
                  <div className="flex flex-col items-center justify-center">
                    <Spinner>Uploading</Spinner>
                    <span className="mt-2 font-light text-color-0400">Progress: {percent}%</span>
                  </div>
                </Centered>
              </div>
            ) : (
              <div>
                <>
                  <h2 className="font-medium text-slate-700"> Update Default Project </h2>
                  <p className="font-light text-slate-500"> Update the default project by uploading a new package (vdusim.tar.gz).</p>
                </>
                <div className="flex items-center">
                  <span className="inline-flex sm:shadow-sm">
                    <button
                      type="button"
                      onClick={() => this.handleUploadClick("create")}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-slate-500 bg-cds-white text-sm font-medium text-slate-700 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-0 focus:border-slate-500"
                    >
                      <IconRenderer icon="UploadFile" />
                      <span className="ml-2.5">Upload</span>
                    </button>
                    <a
                      type="button"
                      href="/vdusim.tar.gz"
                      download="vdusim.tar.gz"
                      className="inline-flex -ml-px relative items-center px-4 py-2 rounded-r-md border border-slate-500 bg-cds-white text-sm font-medium text-slate-700 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-0 focus:border-slate-500"
                    >
                      <IconRenderer icon="FileDownload" />
                      <span className="ml-2.5">Download</span>
                    </a>
                  </span>
                  <input type="file" ref={this.hiddenFileInput} className="hidden sr-only" onChange={this.handleHiddenInputChange} multiple={false} />
                </div>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

SettingsPage.contextType = WebContext;
export default SettingsPage;
