import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import copy from "copy-to-clipboard";
import { TestCaseTypes } from "engine_utils";
import Swal from "sweetalert2";

import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";
import LabelRenderer from "@tailwindrender/renderers/common/LabelRenderer";
import {
  Centered,
  IconButton,
  Spinner,
  Tooltip,
  NewlineText,
  EmptyIconRenderer,
  SearchComponent,
  IconRenderer,
  UploadFile,
  Toast
} from "@utilities/.";
import {
  fetchTestCaseList,
  createTestCase,
  resetTestCaseFlags,
  deleteTestCase,
  updateTestCase,
  fetchTestCase,
  cloneTestCase,
  runTestCase,
  swapTestCase,
  actionTypes
} from "@redux-actions/.";

import CreateTestCaseDialog from "./CreateTestCaseDialog";
import UpdateTestCaseDialog from "./UpdateTestCaseDialog";
import { cropString } from "../utils";
import { PageHeader, Page, PageActions, PageBody, PageTitle, PageListCount } from "../common/PageLayoutComponents";
import FirstTimeCard from "../common/FirstTimeCard";
import CardLayout from "../common/CardLayout";
import { ActionButton, CardHeaders, MoreActionsDropDowns } from "../common/DisplayCard";

function TestCaseManagement({ project, scenario, changeTestScenario, windowDimension, pageTitle, runCompleteTestSuite }) {
  const dispatch = useDispatch();
  const { state } = useLocation();
  const [selectedTestCase, setSelectedTestCase] = useState(state?.selectedTestCase);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(state?.showUpdateDialog);
  const [progress, setProgress] = useState(0);

  const { isFirstTestCase, loading, testcases, totalItems, details, message, showMessage, listLoading } = useSelector((state) => state.testcase);

  const fetchTestCases = useCallback(() => {
    if (!listLoading && project?.id && scenario?.id) {
      dispatch(fetchTestCaseList(project?.id, scenario?.id));
    }
  }, [listLoading, project, scenario]);

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
        width: 550,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetTestCaseFlags());
          fetchTestCases();
        }
      });
    }
  }, [showMessage]);

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
        accept: "application/json",
        "aria-label": "Upload Test Case Export file(JSON)"
      }
    }).then(async ({ value: file }) => {
      if (file) {
        const formData = new FormData();
        formData.append("upload-file", file);
        const response = await UploadFile(
          "POST",
          `/api/v1/project/${project?.id}/suite/${scenario?.id}/testcase/${tc?.id}/import`,
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
            <PageTitle>{pageTitle}</PageTitle>
          </PageHeader>
          <PageBody>
            <Centered>
              <FirstTimeCard
                id="first-test-case"
                icon="AddTask"
                loading={loading}
                onClick={() => setShowCreateDialog(true)}
                onClose={() => changeTestScenario(null)}
                title="Create first Test Case"
                details={`Test Suite: ${scenario?.name}`}
                buttonTitle="Create"
                buttonIcon="PostAdd"
              />
            </Centered>
          </PageBody>
        </Page>
      ) : (
        <RenderList
          pageTitle="Test Cases"
          testcases={testcases}
          totalItems={totalItems}
          showAddTestCaseDialog={() => setShowCreateDialog(true)}
          loading={loading}
          listLoading={listLoading}
          editTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            setShowUpdateDialog(true);
            dispatch(fetchTestCase(project?.id, scenario?.id, selectedTestCase.id));
          }}
          updateTestCase={(id, t) => dispatch(updateTestCase(project?.id, scenario?.id, id, t))}
          swapTestCase={(s, t) => dispatch(swapTestCase(project?.id, scenario?.id, s, t))}
          deleteTestCase={(selectedTestCase) => {
            dispatch(deleteTestCase(project?.id, scenario?.id, selectedTestCase?.id));
          }}
          cloneTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            dispatch(cloneTestCase(project?.id, scenario?.id, selectedTestCase.id));
          }}
          runTestCase={(selectedTestCase) => {
            dispatch(runTestCase(project?.id, selectedTestCase.id));
          }}
          importTestCase={(selectedTestCase) => {
            setSelectedTestCase(selectedTestCase);
            importTestCase(selectedTestCase);
          }}
          runCompleteTestSuite={() => runCompleteTestSuite(scenario?.id)}
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
            dispatch(updateTestCase(project?.id, scenario?.id, selectedTestCase.id, t));
            resetState();
          }}
          windowDimension={windowDimension}
          project={project}
        />
      )}
    </>
  );
}

export default TestCaseManagement;

function RenderList({
  pageTitle,
  testcases = [],
  showAddTestCaseDialog,
  loading,
  listLoading,
  editTestCase,
  deleteTestCase,
  updateTestCase,
  swapTestCase,
  cloneTestCase,
  runTestCase,
  importTestCase,
  runCompleteTestSuite
}) {
  const [detailedView, setDetailedView] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  useEffect(() => {
    const searchText = search?.toLowerCase() || "";
    setFiltered(
      isEmpty(searchText)
        ? testcases
        : testcases.filter(
            (tc) =>
              tc.label.toLowerCase().includes(searchText) ||
              tc.title.toLowerCase().includes(searchText) ||
              tc.given?.toLowerCase().includes(searchText) ||
              tc.when?.toLowerCase().includes(searchText) ||
              tc.then?.toLowerCase().includes(searchText) ||
              tc.tags?.find((tag) => tag.toLowerCase().includes(searchText))
          )
    );
  }, [search, testcases]);

  return (
    <Page>
      <PageHeader>
        <PageTitle>
          <PageListCount pageTitle={pageTitle} count={testcases.length} listLoading={listLoading} />
        </PageTitle>
        <PageActions>
          <SearchComponent placeholder="Search for Test Case" onChange={setSearch} />
          <LabelRenderer label="Show Details" />
          <Tooltip title="Enable To View Test Case Details">
            <TailwindToggleRenderer
              path="show-details"
              visible={true}
              enabled={true}
              data={detailedView}
              handleChange={(_, ev) => setDetailedView(ev)}
            />
          </Tooltip>
          <IconButton title="Run" icon="PlayCircleFilled" onClick={runCompleteTestSuite} tooltip="Execute Test Suite" />
          <IconButton title="Create" icon="AddCircle" onClick={showAddTestCaseDialog} tooltip="Create New Test Case" />
        </PageActions>
      </PageHeader>
      <PageBody>
        {loading ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : filtered?.length === 0 ? (
          <Centered>
            <EmptyIconRenderer title="Test Case Not Found" />
          </Centered>
        ) : (
          <div className="relative w-full">
            <CardHeaders
              items={[
                { colSpan: 1, label: "#TID" },
                { colSpan: 9, label: "Test Description" },
                { colSpan: 2, label: "Actions" }
              ]}
            />
            <div className="grid grid-cols-1 gap-y-2.5 pr-0">
              {filtered.map((s, index) => (
                <DisplayTestCase
                  key={index}
                  rowIndex={index}
                  editTestCase={editTestCase}
                  record={s}
                  records={filtered}
                  swapTestCase={swapTestCase}
                  updateTestCase={updateTestCase}
                  deleteTestCase={deleteTestCase}
                  cloneTestCase={cloneTestCase}
                  runTestCase={runTestCase}
                  importTestCase={importTestCase}
                  detailedView={detailedView}
                />
              ))}
            </div>
          </div>
        )}
      </PageBody>
    </Page>
  );
}

function DisplayTestCase({
  rowIndex,
  record,
  records,
  editTestCase,
  swapTestCase,
  deleteTestCase,
  cloneTestCase,
  updateTestCase,
  runTestCase,
  importTestCase,
  detailedView
}) {
  const tcType = TestCaseTypes[record.type] || "Unknown";

  const handleExportTestCase = () => {
    const copy = {
      type: tcType
    };
    ["seqNo", "enabled", "title", "given", "when", "then", "execSteps", "settings", "tags"].forEach(function (key) {
      copy[key] = record[key];
    });
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(copy, null, 2));
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", `testcase_TCID-${record.seqNo}.json`);
    linkElement.click();
  };

  const handleImportTestCase = () => importTestCase(record);

  const handleEditTestCase = () => editTestCase(record);

  const handleMoveUp = () => swapTestCase(record.id, records[rowIndex - 1].id);

  const handleMoveDown = () => swapTestCase(record.id, records[rowIndex + 1].id);

  const handleDeleteProject = () =>
    Swal.fire({
      title: "Are you sure you want to Delete the Test Case?",
      text: `TID: #${record.label}`,
      icon: "question",
      confirmButtonText: "YES",
      confirmButtonColor: `${record.enabled ? "red" : "green"}`,
      showCancelButton: true,
      cancelButtonText: "NO",
      cancelButtonColor: `${record.enabled ? "green" : "red"}`,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        deleteTestCase(record);
      }
    });

  const handleCloneTestCase = () =>
    Swal.fire({
      title: "Are you sure you want to Clone the Test Case?",
      text: `TID: #${record.label}`,
      icon: "question",
      confirmButtonText: "YES",
      confirmButtonColor: "green",
      showCancelButton: true,
      cancelButtonText: "NO",
      cancelButtonColor: "red",
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        cloneTestCase(record);
      }
    });

  const handleRunTestCase = () => runTestCase(record);

  const more = [
    {
      icon: "FileCopy",
      label: "Clone",
      onClick: handleCloneTestCase,
      tooltip: "Clone Complete Test Case",
      description: (
        <p>
          Clone the <strong>Test Case {record.label}</strong>.
        </p>
      )
    },
    {
      icon: "Delete",
      label: "Delete",
      onClick: handleDeleteProject,
      tooltip: "Delete Test Case",
      className: "group-hover:text-red-500",
      description: (
        <p>
          Permanently purges the <strong>Test Case</strong> from system including all backups.
        </p>
      )
    },
    {
      icon: "FileDownload",
      label: "Export",
      onClick: handleExportTestCase,
      tooltip: "Export Test Case",
      description: (
        <p>
          Export the <strong>Test Case</strong> in JSON format.
          <br />
          Filename: {`testcase_TCID-${record.seqNo}.json`}
        </p>
      )
    },
    {
      icon: "FileUpload",
      label: "Import",
      onClick: handleImportTestCase,
      tooltip: (
        <p>
          Import the <strong>Test Case</strong>.
        </p>
      )
    }
  ];

  if (rowIndex > 0) {
    more.push({
      icon: "KeyboardDoubleArrowUp",
      label: "Move Up",
      onClick: handleMoveUp
    });
  }
  if (rowIndex < records.length - 1) {
    more.push({
      icon: "KeyboardDoubleArrowDown",
      label: "Move Down",
      onClick: handleMoveDown
    });
  }
  return (
    <CardLayout key={"row-" + rowIndex} className="grid grid-cols-12 mb-1" onDoubleClick={handleEditTestCase}>
      <div className="col-span-1 flex flex-col text-center justify-center cursor-pointer">
        <div className="flex flex-col break-all text-center items-center justify-between border-r">
          <label
            className="mt-2 text-sm cursor-pointer select-all"
            onClick={() => {
              copy(record.label);
              Toast.fire({
                icon: "success",
                title: `Copied TID: ${record.label}`
              });
            }}
          >
            {record.label}
          </label>
          <label className="mt-2 text-xs font-normal">{tcType}</label>
          <div className={`text-white text-xs text-center font-bold mt-2 px-1 py-0.5 w-16 rounded ${record.enabled ? "bg-green-600" : "bg-red-600"}`}>
            {record.enabled ? "Active" : "In-Active"}
          </div>
          {detailedView &&
            record?.tags?.length > 0 &&
            record.tags.map((tag, i) => (
              <p key={tag + i} className="mr-0.5 text-[9px] text-color-0800">
                #{tag}
              </p>
            ))}
        </div>
      </div>
      <div className="flex flex-col col-span-9 px-2 cursor-pointer border-r justify-center">
        {record.id && (
          <div className="text-color-label break-words select-all flex flex-row items-center mb-3">
            <IconRenderer icon="Fingerprint" className="text-color-0600 mr-2" style={{ fontSize: 15 }} />
            <Tooltip title="Unique Identifier">
              <label
                className="text-xs"
                onClick={() => {
                  copy(record.id);
                  Toast.fire({
                    icon: "success",
                    title: `Copied UUID: ${record.id}`
                  });
                }}
              >
                {record.id}
              </label>
            </Tooltip>
          </div>
        )}
        <div className="text-color-label break-words select-all flex flex-row items-center">
          <IconRenderer icon="Title" className="text-color-0600 mr-2" style={{ fontSize: 15 }} />
          <Tooltip title={record.label} content={<NewlineText text={record.title} />} placement="bottom">
            <NewlineText text={record.title} />
          </Tooltip>
        </div>
        {detailedView && (record.given != "" || record.when != "" || record.then != "") && (
          <>
            <div className="grid grid-cols-9 gap-x-2 text-center font-medium border-t-2 mt-2 py-1">
              <div className="col-span-3 border-r">Given</div>
              <div className="col-span-3 border-r">When</div>
              <div className="col-span-3">Then</div>
            </div>
            <div className="grid grid-cols-9 gap-x-2">
              <div className="px-2 break-words col-span-3 cursor-pointer border-r">
                <Tooltip title={record.label} content={<NewlineText text={record.given} />} placement="bottom">
                  <NewlineText text={record.given && cropString(record.given, 45 * 3).toString()} />
                </Tooltip>
              </div>
              <div className="px-2 break-words col-span-3 cursor-pointer border-r">
                <Tooltip title={record.label} content={<NewlineText text={record.when} />} placement="bottom">
                  <NewlineText text={record.when && cropString(record.when, 45 * 3).toString()} />
                </Tooltip>
              </div>
              <div className="px-2 break-words col-span-3 cursor-pointer">
                <Tooltip title={record.label} content={<NewlineText text={record.then} />} placement="bottom">
                  <NewlineText text={record.then && cropString(record.then, 45 * 3).toString()} />
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-row col-span-2 items-center min-w-[100px] w-full justify-end">
        <div className="flex flex-row items-center justify-end pr-1 space-x-2">
          <Tooltip title="Enable/Disable test case" placement="bottom">
            <TailwindToggleRenderer
              path={"tc-" + rowIndex}
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
                  cancelButtonColor: `${record.enabled ? "green" : "red"}`,
                  allowEscapeKey: false,
                  allowOutsideClick: false
                }).then((response) => {
                  if (response.isConfirmed) {
                    updateTestCase(record.id, {
                      enabled: ev
                    });
                  }
                })
              }
            />
          </Tooltip>
          {record.type > 0 && (
            <ActionButton
              icon="PlayArrow"
              onClick={handleRunTestCase}
              tooltip="Run Test Case"
              description={
                <p>
                  Start the execution of Test Case <strong>{record.label}</strong>
                </p>
              }
            />
          )}
          <ActionButton tooltip="Modify Steps" icon="Edit" onClick={handleEditTestCase} />
        </div>
        <MoreActionsDropDowns id={record.id} elements={more} />
      </div>
    </CardLayout>
  );
}
