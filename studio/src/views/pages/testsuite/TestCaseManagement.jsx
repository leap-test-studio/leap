import React, { useState } from "react";
import IconButton from "../../utilities/IconButton";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import { cropString } from "../utils";
import Centered from "../../utilities/Centered";
import Spinner from "../../utilities/Spinner";
import Tooltip from "../../utilities/Tooltip";
import IconRenderer from "../../IconRenderer";
import SearchComponent from "../../utilities/Search";
import WebContext from "../../context/WebContext";
import {
  fetchTestCaseList,
  createTestCase,
  resetTestCaseFlags,
  deleteTestCase,
  updateTestCase,
  fetchTestCase,
  cloneTestCase,
  runTestCase
} from "../../../redux/actions/TestCaseActions";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import CreateTestCaseDialog from "./CreateTestCaseDialog";
import CustomAlertDialog from "../../utilities/CustomAlertDialog";
import UpdateTestCaseDialog from "./UpdateTestCaseDialog";
import isEmpty from "lodash/isEmpty";
import PageHeader, { Page, PageActions, PageBody, PageTitle } from "../common/PageHeader";
import FirstTimeCard from "../common/FirstTimeCard";
import EmptyIconRenderer from "../../utilities/EmptyIconRenderer";

const TC_TYPES = ["Scenario", "REST-API", "Web", "SSH"];

class TestCaseManagement extends React.Component {
  state = {
    selectedTestCase: null,
    showDeleteDialog: false,
    showAddTestCaseDialog: false,
    showUpdateTestCaseDialog: false,
    showMessage: false,
    isError: false,
    message: ""
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { testcase } = nextProps;
    if (testcase.isTestCaseCloned || testcase.isTestCaseDeleted || testcase.isTestCaseCreated || testcase.isTestCaseUpdated) {
      return {
        ...prevState,
        message: testcase.message,
        isError: false,
        showMessage: true
      };
    }

    if (testcase.isTestCaseCreateFailed || testcase.isTestCaseCloneFailed || testcase.isTestCaseDeleteFailed) {
      return {
        ...prevState,
        message: testcase.message,
        isError: true,
        showMessage: true,
        loading: testcase.loading
      };
    }

    if (testcase.case) {
      return {
        ...prevState,
        selectedTestCase: testcase.case
      };
    }
    return {
      ...prevState,
      loading: testcase.loading
    };
  }

  componentDidMount() {
    this.fetchTestCaseList();
  }

  fetchTestCaseList() {
    if (this.context.project?.id && this.props.testsuite?.id) {
      this.props.fetchTestCaseList(this.context.project?.id, this.props.testsuite?.id);
    }
  }

  handleCreateTestCase(record) {
    this.props.createTestCase(this.context.project?.id, this.props.testsuite?.id, record);
    this.setState({
      showAddTestCaseDialog: false
    });
  }

  render() {
    const { isFirstTestCase, loading, testcases } = this.props.testcase;
    const { selectedTestCase, showDeleteDialog, showAddTestCaseDialog, showUpdateTestCaseDialog, showMessage, isError, message } = this.state;
    return (
      <>
        {isFirstTestCase ? (
          <Page>
            <PageHeader>
              <PageTitle>Test Cases</PageTitle>
            </PageHeader>
            <PageBody>
              <Centered>
                <FirstTimeCard
                  id="first-test-case"
                  icon="AddTask"
                  loading={loading}
                  onClick={() => this.setState({ showAddTestCaseDialog: true })}
                  onClose={() => this.props.onClose()}
                  title="Create first TestCase"
                  details={`TestSuite: ${this.props.testsuite?.name}`}
                  buttonTitle="Create"
                  buttonIcon="PostAdd"
                />
              </Centered>
            </PageBody>
          </Page>
        ) : (
          <RenderList
            testcases={testcases}
            showDeleteDialog={(selectedTestCase) => this.setState({ showDeleteDialog: true, selectedTestCase })}
            showAddTestCaseDialog={() => this.setState({ showAddTestCaseDialog: true })}
            loading={loading}
            editTestCase={(selectedTestCase) => {
              this.props.fetchTestCase(this.context.project?.id, this.props.testsuite?.id, selectedTestCase.id);
              this.setState({ showUpdateTestCaseDialog: true, selectedTestCase });
            }}
            updateTestCase={(t) => this.props.updateTestCase(this.context.project?.id, this.props.testsuite?.id, t.id, t)}
            deleteTestCase={(selectedTestCase) => this.setState({ showDeleteDialog: true, selectedTestCase })}
            cloneTestCase={(selectedTestCase) => this.props.cloneTestCase(this.context.project?.id, this.props.testsuite?.id, selectedTestCase.id)}
            runTestCase={(selectedTestCase) => this.props.runTestCase(this.context.project?.id, [selectedTestCase.id])}
            onClose={() => this.props.onClose()}
          />
        )}
        {showDeleteDialog && (
          <DeleteItemDialog
            title="Delete Test Case"
            question="Are you sure you want to delete the selected Test Case?"
            showDialog={showDeleteDialog}
            onClose={() =>
              this.setState({
                selectedTestCase: null,
                showDeleteDialog: false
              })
            }
            item={selectedTestCase.name}
            onDelete={() => {
              this.props.deleteTestCase(this.context.project?.id, this.props.testsuite?.id, selectedTestCase?.id);
              this.setState({
                selectedTestCase: null,
                showDeleteDialog: false
              });
            }}
          />
        )}
        {showAddTestCaseDialog && (
          <CreateTestCaseDialog
            showDialog={showAddTestCaseDialog}
            onClose={() =>
              this.setState({
                showAddTestCaseDialog: false
              })
            }
            createTestCase={(s) => this.handleCreateTestCase(s)}
          />
        )}
        {showUpdateTestCaseDialog && (
          <UpdateTestCaseDialog
            testsuite={this.props.testsuite}
            testcase={selectedTestCase}
            isOpen={showUpdateTestCaseDialog}
            onClose={() => this.setState({ showUpdateTestCaseDialog: false, selectedTestCase: null })}
            onUpdate={(t) => {
              this.setState({ showUpdateTestCaseDialog: false, selectedTestCase: null });
              this.props.updateTestCase(this.context.project?.id, this.props.testsuite?.id, t.id, t);
            }}
          />
        )}
        <CustomAlertDialog
          level={isError ? "warn" : "success"}
          message={message}
          showDialog={showMessage}
          onClose={() => {
            this.fetchTestCaseList();
            this.setState({ showMessage: false, message: "", isError: false });
            this.props.resetTestCaseFlags();
          }}
        />
      </>
    );
  }
}
TestCaseManagement.contextType = WebContext;

const mapStateToProps = (state) => ({
  fetchTestCaseList: PropTypes.func.isRequired,
  createTestCase: PropTypes.func.isRequired,
  resetTestCaseFlags: PropTypes.func.isRequired,
  deleteTestCase: PropTypes.func.isRequired,
  updateTestCase: PropTypes.func.isRequired,
  fetchTestCase: PropTypes.func.isRequired,
  cloneTestCase: PropTypes.func.isRequired,
  runTestCase: PropTypes.func.isRequired,
  testcase: state.testcase
});

export default connect(mapStateToProps, {
  fetchTestCaseList,
  createTestCase,
  resetTestCaseFlags,
  deleteTestCase,
  updateTestCase,
  fetchTestCase,
  cloneTestCase,
  runTestCase
})(TestCaseManagement);

function RenderList({ testcases = [], showAddTestCaseDialog, loading, editTestCase, deleteTestCase, updateTestCase, cloneTestCase, runTestCase }) {
  const [search, setSearch] = useState("");
  const exportTestCases = (data) => {
    const exportData = data.map((d) => {
      return {
        TCID: "TCID-" + d.seqNo,
        Type: TC_TYPES[d.type],
        ...d
      };
    });

    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "testcases.json");
    linkElement.click();
  };

  let filtered = [];
  if (isEmpty(search)) {
    filtered = testcases;
  } else {
    const searchText = search.toLowerCase();
    filtered = testcases?.filter(
      (tc) =>
        String("TCID-" + tc.seqNo)
          .toLowerCase()
          .includes(searchText) ||
        tc.given?.toLowerCase().includes(searchText) ||
        tc.when?.toLowerCase().includes(searchText) ||
        tc.then?.toLowerCase().includes(searchText)
    );
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Cases</PageTitle>
        <PageActions>
          <SearchComponent search={search} placeholder="Search" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <IconButton title="Add New" icon="AddTask" onClick={() => showAddTestCaseDialog()} />
          <Tooltip title="Export Test Cases">
            <IconButton title="Export" icon="FileDownload" disabled={testcases.length === 0} onClick={() => exportTestCases(testcases)} />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <PageBody>
        {loading ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : filtered?.length === 0 ? (
          <Centered>
            <EmptyIconRenderer title="TestCase Not Found" />
          </Centered>
        ) : (
          <table className="relative w-full border">
            <TableHeader headers={["#TID", "Given", "When", "Then", "Type", "Actions"]} />
            {filtered?.length > 0 && (
              <tbody className="divide-y">
                {filtered.map((s, index) => (
                  <Row
                    key={index}
                    rowIndex={index}
                    editTestCase={editTestCase}
                    record={s}
                    updateTestCase={updateTestCase}
                    deleteTestCase={deleteTestCase}
                    cloneTestCase={cloneTestCase}
                    runTestCase={runTestCase}
                  />
                ))}
              </tbody>
            )}
          </table>
        )}
      </PageBody>
    </Page>
  );
}

function TableHeader(props) {
  return (
    <thead>
      <tr>
        {props.headers.map((header, index) => (
          <Header key={index} title={header} />
        ))}
      </tr>
    </thead>
  );
}
function Header({ title }) {
  return (
    <th className="sticky top-0 pl-2 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider truncate">
      {title}
    </th>
  );
}

function Row({ rowIndex, record, editTestCase, deleteTestCase, cloneTestCase, updateTestCase, runTestCase }) {
  const tcType = TC_TYPES[record.type] || "Unknown";
  return (
    <tr key={"row-" + rowIndex} className="bg-white hover:bg-slate-50 border-b border-slate-200 text-sm">
      <td className="pl-2 w-[5.2rem]">
        <div className="flex flex-row items-center justify-start">
          <input
            type="checkbox"
            name={rowIndex}
            id={"check-" + rowIndex}
            className="text-color-0800 rounded mx-1"
            checked={record.enabled}
            onChange={(_ev) =>
              updateTestCase({
                id: record.id,
                enabled: _ev.target.checked
              })
            }
          />
          <label className="w-20">{`TCID-${record.seqNo}`}</label>
        </div>
      </td>
      <td className="px-2 py-0.5 h-16 break-words max-w-[10rem]">
        <Tooltip title={`TCID-${record.seqNo}`} content={record.given} placement="bottom">
          <label>{record.given && cropString(record.given, 35 * 3).toString()}</label>
        </Tooltip>
      </td>
      <td className="px-2 py-0.5 h-16 break-words max-w-[10rem]">
        <Tooltip title={`TCID-${record.seqNo}`} content={record.when} placement="bottom">
          <label>{record.when && cropString(record.when, 35 * 3).toString()}</label>
        </Tooltip>
      </td>
      <td className="px-2 py-0.5 h-16 break-words max-w-[10rem]">
        <Tooltip title={`TCID-${record.seqNo}`} content={record.then} placement="bottom">
          <label>{record.then && cropString(record.then, 35 * 3).toString()}</label>
        </Tooltip>
      </td>
      <td className="px-2 py-0.5 w-20">
        <label
          className={`text-xs font-normal select-none ${
            record.status === 0
              ? "bg-purple-300"
              : record.status === 1
              ? "bg-indigo-300"
              : record.status === 2
              ? "bg-blue-300"
              : record.status === 3
              ? "bg-violet-400"
              : ""
          }`}
        >
          {tcType}
        </label>
      </td>
      <td className="px-2 py-0.5 w-40">
        <div className="flex flex-row">
          <IconRenderer
            icon="PlayArrowRounded"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            fontSize="medium"
            onClick={() => runTestCase(record)}
          />
          <IconRenderer
            icon="ContentCopy"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            fontSize="medium"
            onClick={() => cloneTestCase(record)}
          />
          <IconRenderer
            icon="Edit"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            fontSize="medium"
            onClick={() => editTestCase(record)}
          />
          <IconRenderer
            icon="DeleteForever"
            className="text-color-0500 hover:text-cds-red-0600 mr-2 cursor-pointer"
            fontSize="medium"
            onClick={() => deleteTestCase(record)}
          />
          <IconRenderer
            icon="FileDownload"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            fontSize="medium"
            onClick={() => {
              const copy = {
                type: tcType
              };
              ["seqNo", "enabled", "given", "when", "then", "execSteps", "settings", "tags"].forEach(function (key) {
                copy[key] = record[key];
              });
              const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(copy, null, 2));
              const linkElement = document.createElement("a");
              linkElement.setAttribute("href", dataUri);
              linkElement.setAttribute("download", `testcase_TCID-${record.seqNo}.json`);
              linkElement.click();
            }}
          />
        </div>
      </td>
    </tr>
  );
}
