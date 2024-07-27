import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import * as actionTypes from "../../../redux/actions";


import CreateTestCaseDialog from "./CreateTestCaseDialog";
import UpdateTestCaseDialog from "./UpdateTestCaseDialog";
import { cropString } from "../utils";
import { Centered, IconButton, Spinner, Tooltip, NewlineText, EmptyIconRenderer, SearchComponent, IconRenderer, UploadFile } from "../../utilities";
import {
  fetchTestCaseList,
  createTestCase,
  resetTestCaseFlags,
  deleteTestCase,
  updateTestCase,
  fetchTestCase,
  cloneTestCase,
  runTestCases
} from "../../../redux/actions/TestCaseActions";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";
import FirstTimeCard from "../common/FirstTimeCard";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import Swal from "sweetalert2";

const TC_TYPES = ["Definition", "REST-API", "Web", "SSH"];

function TestCaseManagement({ project, scenario, changeTestScenario, windowDimension }) {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const [selectedTestCase, setSelectedTestCase] = useState(state?.selectedTestCase);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(state?.showUpdateDialog);
  const [progress, setProgress] = useState(0);

  const { isFirstTestCase, loading, testcases, details, message, showMessage } = useSelector((state) => state.testcase);

  useEffect(() => {
    fetchTestCases();
    return () => setSelectedTestCase(null);
  }, []);

  useEffect(() => {
    if (showMessage) {
      Swal.fire({
        title: message,
        icon: showMessage,
        text: details,
        width: 550
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetTestCaseFlags());
          fetchTestCases();
        }
      });
    }
  }, [showMessage]);

  const fetchTestCases = () => {
    if (project?.id && scenario?.id) {
      dispatch(fetchTestCaseList(project?.id, scenario?.id));
    }
  };

  const resetState = () => {
    setSelectedTestCase(null);
    setShowCreateDialog(false);
    setShowUpdateDialog(false);
  };

  const importTestCase = (tc) => {

    Swal.fire({
      title: "Select JSON File",
      text: `Import Configuration for TID: ${tc?.label}`,
      input: "file",
      inputAttributes: {
        "accept": "application/json",
        "aria-label": "Upload Test Case Export file(JSON)"
      }
    }).then(async ({ value: file }) => {
      if (file) {
        const formData = new FormData();
        formData.append("upload-file", file);
        const response = await UploadFile(
          "POST",
          `/api/v1/project/${project?.id}/scenario/${scenario?.id}/testcase/${tc?.id}/import`,
          formData,
          (percent) => setProgress(Math.floor(percent))
        );
        const text = await response.text();
        if (response.status == 200) {
          setProgress(0);
          dispatch({
            type: actionTypes.RESET_TESTCASE,
            payload: {
              ...JSON.parse(text),
              showMessage: "success",
              loading: false
            }
          });
        } else {
          setProgress(0);
          dispatch({
            type: actionTypes.RESET_TESTCASE,
            payload: {
              ...JSON.parse(text),
              showMessage: "error",
              loading: false
            }
          });
        }
      }
    });
  };

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
                onClick={() => setShowCreateDialog(true)}
                onClose={() => changeTestScenario(null)}
                title="Create first TestCase"
                details={`Test Scenario: ${scenario?.name}`}
                buttonTitle="Create"
                buttonIcon="PostAdd"
              />
            </Centered>
          </PageBody>
        </Page>
      ) : (
        <RenderList
          testcases={testcases}
          showAddTestCaseDialog={() => setShowCreateDialog(true)}
          loading={loading}
          editTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            setShowUpdateDialog(true);
            dispatch(fetchTestCase(project?.id, scenario?.id, selectedTestCase.id));
          }}
          updateTestCase={(t) => dispatch(updateTestCase(project?.id, scenario?.id, t.id, t))}
          deleteTestCase={(selectedTestCase) => {
            dispatch(deleteTestCase(project?.id, scenario?.id, selectedTestCase?.id));
          }}
          cloneTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            dispatch(cloneTestCase(project?.id, scenario?.id, selectedTestCase.id));
          }}
          runTestCases={(selectedTestCase) => {
            dispatch(runTestCases(project?.id, [selectedTestCase.id]));
          }}
          importTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            importTestCase(selectedTestCase);
          }}
        />
      )}
      {showCreateDialog && (
        <CreateTestCaseDialog
          showDialog={showCreateDialog}
          onClose={resetState}
          createTestCase={(record) => {
            dispatch(createTestCase(project?.id, scenario?.id, record));
            setShowCreateDialog(false);
          }}
        />
      )}
      {showUpdateDialog && (
        <UpdateTestCaseDialog
          testscenario={scenario}
          testcase={selectedTestCase}
          isOpen={showUpdateDialog}
          onClose={resetState}
          onUpdate={(t) => {
            dispatch(updateTestCase(project?.id, scenario?.id, t.id, t));
            resetState();
          }}
          windowDimension={windowDimension}
        />
      )}
    </>
  );
}

export default TestCaseManagement;

function RenderList({
  testcases = [],
  showAddTestCaseDialog,
  loading,
  editTestCase,
  deleteTestCase,
  updateTestCase,
  cloneTestCase,
  runTestCases,
  importTestCase
}) {
  const [search, setSearch] = useState("");

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
        </PageActions>
      </PageHeader>
      <PageBody>
        {loading ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : filtered?.length === 0 ? (
          <EmptyIconRenderer title="Test Case Not Found" />
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
                    runTestCases={runTestCases}
                    importTestCase={importTestCase}
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
    <th className="sticky top-0 pl-2 py-2 border-b-2 border-slate-300 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider truncate">
      {title}
    </th>
  );
}

function Row({ rowIndex, record, editTestCase, deleteTestCase, cloneTestCase, updateTestCase, runTestCases, importTestCase }) {
  const tcType = TC_TYPES[record.type] || "Unknown";

  const exportTestCase = () => {
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
  };
  return (
    <tr key={"row-" + rowIndex} className="bg-white hover:bg-slate-50 border-b border-slate-300 text-xs">
      <td className="border border-r-slate-100 w-[5.5rem]">
        <Tooltip title="Enable/Disable test case" placement="bottom">
          <div className="flex flex-row items-center justify-between px-2">
            <TailwindToggleRenderer
              path={rowIndex}
              visible={true}
              enabled={true}
              data={record.enabled}
              handleChange={(_, ev) =>
                Swal.fire({
                  title: `Are you sure you want to ${record.enabled ? "Disable" : "Enable"} the Test Case?`,
                  text: `TID: #${record.label}`,
                  confirmButtonText: "YES",
                  icon: "question",
                  confirmButtonColor: `${record.enabled ? "red" : "green"}`,
                  showCancelButton: true,
                  cancelButtonText: "NO",
                  cancelButtonColor: `${record.enabled ? "green" : "red"}`
                }).then((response) => {
                  if (response.isConfirmed) {
                    updateTestCase({
                      id: record.id,
                      enabled: ev
                    });
                  }
                })
              }
            />
            <label className="pl-4">{record.label}</label>
          </div>
        </Tooltip>
      </td>
      <td className="p-1.5 border border-r-slate-100 break-words max-w-[10rem]">
        <Tooltip title={record.label} content={<NewlineText text={record.given} />} placement="bottom">
          <NewlineText text={record.given && cropString(record.given, 40 * 3).toString()} />
        </Tooltip>
      </td>
      <td className="p-1.5 border border-r-slate-100 break-words max-w-[10rem]">
        <Tooltip title={record.label} content={<NewlineText text={record.when} />} placement="bottom">
          <NewlineText text={record.when && cropString(record.when, 40 * 3).toString()} />
        </Tooltip>
      </td>
      <td className="p-1.5 border border-r-slate-100 break-words max-w-[10rem]">
        <Tooltip title={record.label} content={<NewlineText text={record.then} />} placement="bottom">
          <NewlineText text={record.then && cropString(record.then, 40 * 3).toString()} />
        </Tooltip>
      </td>
      <td className="px-2 py-0.5 border border-r-slate-100 w-20">
        <label
          className={`text-xs font-normal select-none ${record.status === 0
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
        <div className="flex flex-row justify-end">
          {record.type > 0 && (
            <IconRenderer
              icon="PlayArrow"
              className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
              style={{ fontSize: 18 }}
              onClick={() => runTestCases(record)}
            />
          )}
          <IconRenderer
            icon="FileCopy"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={() =>
              Swal.fire({
                title: "Are you sure you want to Clone the Test Case?",
                text: `TID: #${record.label}`,
                icon: "question",
                confirmButtonText: "YES",
                confirmButtonColor: "green",
                showCancelButton: true,
                cancelButtonText: "NO",
                cancelButtonColor: "red"
              }).then((response) => {
                if (response.isConfirmed) {
                  cloneTestCase(record);
                }
              })
            }
          />
          <IconRenderer
            icon="Edit"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={() => editTestCase(record)}
          />
          <IconRenderer
            icon="DeleteForever"
            className="text-color-0500 hover:text-cds-red-0600 mr-2 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={() =>
              Swal.fire({
                title: "Are you sure you want to Delete the Test Case?",
                text: `TID: #${record.label}`,
                icon: "question",
                confirmButtonText: "YES",
                confirmButtonColor: `${record.enabled ? "red" : "green"}`,
                showCancelButton: true,
                cancelButtonText: "NO",
                cancelButtonColor: `${record.enabled ? "green" : "red"}`
              }).then((response) => {
                if (response.isConfirmed) {
                  deleteTestCase(record);
                }
              })
            }
          />
          <IconRenderer
            icon="FileDownload"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={exportTestCase}
          />
          <IconRenderer
            icon="FileUpload"
            className="text-color-0500 hover:text-cds-blue-0500 mr-2 cursor-pointer"
            style={{ fontSize: 18 }}
            onClick={() => importTestCase(record)}
          />
        </div>
      </td>
    </tr>
  );
}
