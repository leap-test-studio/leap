import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import React, { useCallback, useContext, useEffect, useState } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";

import { Centered, IconButton, Tooltip, EmptyIconRenderer, SearchComponent, Spinner } from "@utilities/.";
import CloneTestScenarioDialog from "./CloneTestScenarioDialog";
import CreateTestScenarioDialog from "./CreateTestScenarioDialog";
import TestCaseManagement from "./TestCaseManagement";
import {
  createTestScenario,
  fetchTestScenarioList,
  deleteTestScenario,
  resetTestScenarioFlags,
  updateTestScenario,
  cloneTestScenario,
  runTestSuite,
  fetchTestCaseList
} from "@redux-actions/.";
import WebContext from "@WebContext";

import { PageHeader, Page, PageActions, PageBody, PageTitle, PageListCount } from "../common/PageLayoutComponents";
import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import TestScenarioSettingsDialog from "./TestScenarioSettingsDialog";

dayjs.extend(relativeTime);

function TestSuiteManagement(props) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState(null);
  const [selectedTestScenario, setSelectedTestScenario] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);
  const [filtered, setFiltered] = useState([]);

  const { totalItems, testsuites, isFirstTestScenario, showMessage, details, message, loading, listLoading } = useSelector(
    (state) => state.testsuite
  );
  const { project, scenario, changeTestScenario, pageTitle } = props;
  const { getRole } = useContext(WebContext);
  const role = getRole();

  useEffect(() => {
    const searchText = search?.toLowerCase() || "";
    setFiltered(
      isEmpty(searchText)
        ? testsuites
        : testsuites.filter(
            (s) =>
              s.id.includes(searchText) ||
              s.name.toLowerCase().includes(searchText) ||
              s.description?.toLowerCase().includes(searchText) ||
              s.updatedBy?.toLowerCase().includes(searchText) ||
              s.AccountId?.toLowerCase().includes(searchText)
          )
    );
  }, [search, testsuites]);

  const fetchTestScenarios = useCallback(() => {
    if (!listLoading && project?.id) {
      dispatch(fetchTestScenarioList(project.id));
    }
  }, [listLoading, project]);

  useEffect(() => {
    if (project?.id) {
      fetchTestScenarios();
      if (scenario?.id) {
        dispatch(fetchTestCaseList(project?.id, scenario?.id));
      }
    }
  }, [project, scenario]);

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
          dispatch(resetTestScenarioFlags());
          fetchTestScenarios();
        }
      });
    }
  }, [showMessage]);

  const handleCreateTestScenario = (testscenario) => {
    if (project?.id) {
      dispatch(createTestScenario(project?.id, testscenario));
      setShowCreateDialog(false);
    }
  };

  const handleCloneTestScenario = (testscenario) => {
    if (project?.id && selectedTestScenario?.id) {
      dispatch(cloneTestScenario(project?.id, selectedTestScenario.id, testscenario));
      setShowCloneDialog(false);
    }
  };

  const handleDeleteTestScenario = (scenario) => {
    if (project?.id && scenario?.id) {
      dispatch(deleteTestScenario(project?.id, scenario.id));
    }
  };

  const openTestScenario = (testscenario) => {
    if (project?.id && testscenario?.id) {
      changeTestScenario(testscenario);
      dispatch(fetchTestCaseList(project.id, testscenario.id));
    }
  };

  const resetState = () => {
    setSelectedTestScenario(null);
    setShowCreateDialog(false);
    setShowCloneDialog(false);
  };

  const runCompleteTestSuite = (suiteId) => {
    if (project?.id && suiteId)
      Swal.fire({
        title: "Start Scenario Execution?",
        text: `Scenario Id: ${suiteId}`,
        icon: "question",
        confirmButtonText: "YES",
        confirmButtonColor: "green",
        showDenyButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed) {
          dispatch(runTestSuite(project?.id, suiteId));
        }
      });
  };

  if (scenario) {
    return (
      <Centered>
        <TestCaseManagement {...props} runCompleteTestSuite={runCompleteTestSuite} />
      </Centered>
    );
  }

  return (
    <Page>
      <PageHeader show={!isFirstTestScenario}>
        <PageTitle>
          <PageListCount pageTitle={pageTitle} count={totalItems} listLoading={listLoading} />
        </PageTitle>
        <PageActions>
          <SearchComponent placeholder="Search for Test Suite" onChange={setSearch} />
          <IconButton
            title="Create"
            icon="AddCircle"
            onClick={() => setShowCreateDialog(true)}
            tooltip="Create New Test Suite"
            disabled={!role.isLeads}
          />
        </PageActions>
      </PageHeader>
      <PageBody>
        {listLoading && totalItems == 0 ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : isFirstTestScenario ? (
          <Centered>
            <FirstTimeCard
              id="first-test-suite"
              icon="NextWeek"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Suite"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {filtered.length > 0 ? (
              <div className="relative w-full">
                <CardHeaders
                  items={[
                    { colSpan: 5, label: "Suite" },
                    { colSpan: 4, label: "Info" },
                    { colSpan: 1, label: "Status" },
                    { colSpan: 2, label: "Actions" }
                  ]}
                />
                <div className="grid grid-cols-1 gap-y-2.5 pr-0">
                  {filtered.map((testscenario, index) => (
                    <TestScenarioCard
                      {...props}
                      key={index}
                      role={role}
                      testscenario={testscenario}
                      totalItems={totalItems}
                      projectId={project?.id}
                      openTestScenario={openTestScenario}
                      setSelectedTestScenario={setSelectedTestScenario}
                      setShowCloneDialog={setShowCloneDialog}
                      setSettingsDialog={setSettingsDialog}
                      handleDeleteTestScenario={handleDeleteTestScenario}
                      runCompleteTestSuite={runCompleteTestSuite}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Test Suite Not Found" />
                <IconButton title="Refresh" icon="Refresh" onClick={fetchTestScenarios} tooltip="Fetch Test Suites" />
              </Centered>
            )}
          </>
        )}
        <CreateTestScenarioDialog showDialog={showCreateDialog} onClose={resetState} createTestScenario={handleCreateTestScenario} />
        {showCloneDialog && (
          <CloneTestScenarioDialog
            showDialog={showCloneDialog}
            onClose={resetState}
            testscenario={selectedTestScenario}
            cloneTestScenario={handleCloneTestScenario}
          />
        )}
        <TestScenarioSettingsDialog
          {...props}
          role={role}
          showDialog={showSettingsDialog}
          onClose={() => setSettingsDialog(false)}
          project={project}
          scenario={selectedTestScenario}
        />
      </PageBody>
    </Page>
  );
}

export default TestSuiteManagement;

const TestScenarioCard = ({
  projectId,
  testscenario,
  openTestScenario,
  setSelectedTestScenario,
  setShowCloneDialog,
  setSettingsDialog,
  handleDeleteTestScenario,
  runCompleteTestSuite,
  role
}) => {
  const dispatch = useDispatch();

  const { id, name, status, description, createdAt, updatedAt, AccountId, updatedBy } = testscenario;
  const trimmedName = name?.trim() || "";

  const handleOpenSuite = () => openTestScenario(testscenario);

  const handleCloneSuite = () => {
    setSelectedTestScenario(testscenario);
    setShowCloneDialog(true);
  };

  const handleSuiteSettings = () => {
    setSelectedTestScenario(testscenario);
    setSettingsDialog(true);
  };

  const handleDeleteSuite = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Scenario?",
      text: `Scenario: ${trimmedName}`,
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
        handleDeleteTestScenario(testscenario);
      }
    });
  };

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Suite?`,
      text: `Suite Id: ${id}`,
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
        dispatch(updateTestScenario(projectId, id, { name, status: !status }));
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
      prefix: "Last Modified on",
      element: dayjs(Number(new Date(updatedAt).getTime())).fromNow()
    });
  }

  const handleRunTestSuite = () => runCompleteTestSuite(id);

  return (
    <DisplayCard
      id={id}
      name={name}
      description={description}
      status={status}
      onClick={handleOpenSuite}
      moreOptions={[
        {
          icon: "Settings",
          label: "Settings",
          onClick: handleSuiteSettings,
          tooltip: "Test Suite Settings",
          description: (
            <p>
              View and modify the <strong>Test Suite Settings</strong>.
            </p>
          )
        },
        {
          icon: "FileCopy",
          label: "Clone",
          disabled: !role.isLeads,
          onClick: handleCloneSuite,
          tooltip: "Clone Complete Test Suite",
          description: (
            <p>
              Clone the <strong>Test Suite {name}</strong>.
            </p>
          )
        },
        {
          icon: "Delete",
          label: "Delete",
          disabled: !role.isLeads,
          onClick: handleDeleteSuite,
          tooltip: "Delete Test Suite",
          description: (
            <p>
              Permanently purges the <strong>Test Suite</strong> from system including all backups.
            </p>
          )
        }
      ]}
      actions={
        <div className="inline-flex items-center space-x-2">
          <Tooltip
            title="Enable/Disable Test Suite"
            content={
              <p>
                Enable or Disable the <strong>Test Suite</strong>
              </p>
            }
          >
            <TailwindToggleRenderer
              small={true}
              path={"status-" + id}
              visible={true}
              enabled={role.isLeads}
              data={status}
              handleChange={handleToggle}
            />
          </Tooltip>
          {status && (
            <ActionButton
              icon="PlayArrow"
              onClick={handleRunTestSuite}
              tooltip="Run Test Suite"
              description={
                <p>
                  Start execute of Test suite <strong>{name}</strong>
                </p>
              }
            />
          )}
          <ActionButton
            icon="ModeEdit"
            onClick={handleOpenSuite}
            tooltip="Open Test Suite"
            description={
              <p>
                View and modify the <strong>Test Suite</strong>.
              </p>
            }
          />
        </div>
      }
      records={labels}
    />
  );
};
