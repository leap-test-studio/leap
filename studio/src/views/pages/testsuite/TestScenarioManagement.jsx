import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import CloneTestScenarioDialog from "./CloneTestScenarioDialog";
import CreateTestScenarioDialog from "./CreateTestScenarioDialog";
import TestCaseManagement from "./TestCaseManagement";
import { Centered, IconButton, Tooltip, NewlineText, CustomAlertDialog, EmptyIconRenderer, SearchComponent, IconRenderer } from "../../utilities";
import {
  createTestScenario,
  fetchTestScenarioList,
  deleteTestScenario,
  resetTestScenarioFlags,
  updateTestScenario,
  cloneTestScenario,
  runTestScenario
} from "../../../redux/actions/TestScenarioActions";
import { fetchTestCaseList } from "../../../redux/actions/TestCaseActions";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";
import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard from "../common/DisplayCard";
import Swal from "sweetalert2";
import TestScenarioSettingsDialog from "./TestScenarioSettingsDialog";

dayjs.extend(relativeTime);

const MAX_ALLOWED_TEST_SCENARIOS = 25;

function TestScenarioManagement(props) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState(null);
  const [selectedTestScenario, setSelectedTestScenario] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);

  const { testscenarios, isFirstTestScenario, showMessage, details, message, loading } = useSelector((state) => state.testscenario);
  const { project, scenario, changeTestScenario } = props;

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
        width: 550
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

  const fetchTestScenarios = () => project?.id && dispatch(fetchTestScenarioList(project.id));

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

  if (scenario) {
    return (
      <Centered>
        <TestCaseManagement {...props} />
      </Centered>
    );
  }

  const filtered = search?.length > 0 ? testscenarios?.filter((s) => s.name.includes(search)) : testscenarios;

  return (
    <Page>
      <PageHeader show={!isFirstTestScenario}>
        <PageTitle>Test Suites</PageTitle>
        <PageActions>
          <SearchComponent search={search} placeholder="Search scenario name" onChange={setSearch} onClear={() => setSearch("")} />
          <Tooltip
            title={
              testscenarios?.length > MAX_ALLOWED_TEST_SCENARIOS ? (
                <p>
                  Maximum number test scenarios allowed is <strong>{MAX_ALLOWED_TEST_SCENARIOS}</strong>
                </p>
              ) : (
                "Create new test scenario"
              )
            }
          >
            <IconButton
              title="Create"
              icon="AddCircle"
              disabled={testscenarios?.length > MAX_ALLOWED_TEST_SCENARIOS}
              onClick={() => setShowCreateDialog(true)}
            />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstTestScenario ? (
          <Centered>
            <FirstTimeCard
              id="first-test-suite"
              icon="Extension"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create first Suite"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {filtered.length > 0 ? (
              <div className="relative w-full">
                <div className="absoulte sticky top-0 grid grid-cols-12 w-full gap-x-2 bg-white px-4 py-2 rounded-lg border">
                  <div className="col-span-4 text-center border-r">Suite</div>
                  <div className="col-span-4 text-center border-r">Info</div>
                  <div className="col-span-2 text-center border-r">Status</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                <div className="grid grid-cols-1 gap-y-3 pr-0">
                  {filtered.map((testscenario, index) => (
                    <TestScenarioCard
                      key={index}
                      testscenario={testscenario}
                      projectId={project?.id}
                      openTestScenario={openTestScenario}
                      setSelectedTestScenario={setSelectedTestScenario}
                      setShowCloneDialog={setShowCloneDialog}
                      setSettingsDialog={setSettingsDialog}
                      handleDeleteTestScenario={handleDeleteTestScenario}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Test Suite Not Found" />
                <IconButton title="Refresh" icon="Refresh" onClick={fetchTestScenarios} />
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
          showDialog={showSettingsDialog}
          onClose={() => setSettingsDialog(false)}
          project={project}
          scenario={selectedTestScenario}
        />
      </PageBody>
    </Page>
  );
}

export default TestScenarioManagement;

const TestScenarioCard = ({
  projectId,
  testscenario,
  openTestScenario,
  setSelectedTestScenario,
  setShowCloneDialog,
  setSettingsDialog,
  handleDeleteTestScenario
}) => {
  const dispatch = useDispatch();

  const { id, name, status, description, createdAt, updatedAt } = testscenario;
  const trimmedName = name?.trim() || "";

  const editTestScenario = () => openTestScenario(testscenario);

  const run = () => {
    Swal.fire({
      title: "Start Scenario Execution?",
      text: `Scenario Id: ${id}`,
      icon: "question",
      confirmButtonText: "YES",
      showDenyButton: true
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(runTestScenario(projectId, id));
      }
    });
  };

  const cloneTestScenario = () => {
    setSelectedTestScenario(testscenario);
    setShowCloneDialog(true);
  };

  const settingsTestScenario = () => {
    setSelectedTestScenario(testscenario);
    setSettingsDialog(true);
  };

  const deleteTestScenario = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Scenario?",
      text: `Scenario: ${trimmedName}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: "red",
      cancelButtonColor: "green"
    }).then((response) => {
      if (response.isConfirmed) {
        handleDeleteTestScenario(testscenario);
      }
    });
  };

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Suite?`,
      text: `Project Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: `${status ? "red" : "green"}`,
      cancelButtonColor: `${status ? "green" : "red"}`
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(updateTestScenario(projectId, id, { name, status: !status }));
      }
    });
  };

  let labels = [
    {
      icon: "Fingerprint",
      tooltip: `Scenario ID ${id}`,
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
      onClick={editTestScenario}
      actions={
        <div className="flex flex-row mb-0.5 items-center justify-end">
          <Tooltip
            title="Enable/Disable Suite"
            content={
              <p>
                Enable or Disable the <strong>Suite</strong>
              </p>
            }
          >
            <TailwindToggleRenderer small={true} path={id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
          </Tooltip>
          {status && (
            <IconRenderer
              icon="PlayArrow"
              style={{ fontSize: 20 }}
              className="text-color-0600 hover:text-color-0500 mx-1.5 cursor-pointer"
              onClick={run}
              tooltip="Run Suite"
              description={
                <p>
                  Execute test cases of <strong>Suite</strong>
                </p>
              }
            />
          )}
          <IconRenderer
            icon="FileCopy"
            style={{ fontSize: 20 }}
            className="text-color-0600 hover:text-color-0500 mx-1.5 cursor-pointer"
            onClick={cloneTestScenario}
            tooltip="Clone Suite"
            description={
              <p>
                Clone the <strong>Suite</strong>
              </p>
            }
          />
          <IconRenderer
            icon="Settings"
            className="text-color-0600 hover:text-color-0500 mx-1.5 cursor-pointer"
            style={{ fontSize: 20 }}
            onClick={settingsTestScenario}
            tooltip="Test Suite Settings"
            description={
              <p>
                View and modify the <strong>Test Suite Settings</strong>.
              </p>
            }
          />
          <IconRenderer
            icon="ModeEdit"
            style={{ fontSize: 20 }}
            className="text-color-0600 hover:text-color-0500 mx-1.5 cursor-pointer"
            onClick={editTestScenario}
            tooltip="Edit Suite"
            description={
              <p>
                View and modify the <strong>Suite</strong> details.
                <br />
                Create network elements, deploy, Simulate and more
              </p>
            }
          />
          <IconRenderer
            icon="Delete"
            style={{ fontSize: 20 }}
            className="text-color-0600 hover:text-red-600 mx-1.5 cursor-pointer"
            onClick={deleteTestScenario}
            tooltip="Delete Suite"
            description={
              <p>
                Permanently purges the <strong>Suite</strong> from system including all backups.
              </p>
            }
          />
        </div>
      }
      records={labels}
    />
  );
};
