import React, { useEffect, useState } from "react";
import IconButton from "../../utilities/IconButton";
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
import { useDispatch, useSelector } from "react-redux";
import { ProjectColors } from "../common/ProjectColors";
import CreateTestScenarioDialog from "./CreateTestScenarioDialog";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import CustomAlertDialog from "../../utilities/CustomAlertDialog";
import Centered from "../../utilities/Centered";
import SearchComponent from "../../utilities/SearchComponent";
import IconRenderer from "../../IconRenderer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Tooltip from "../../utilities/Tooltip";
import EmptyIconRenderer from "../../utilities/EmptyIconRenderer";
import TestCaseManagement from "./TestCaseManagement";
import NewlineText from "../../utilities/NewlineText";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import CloneTestScenarioDialog from "./CloneTestScenarioDialog";
import PageHeader, { Page, PageActions, PageBody, PageTitle } from "../common/PageHeader";
import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard from "../common/DisplayCard";

dayjs.extend(relativeTime);

const MAX_ALLOWED_TEST_SCENARIOS = 25;

function TestScenarioManagement(props) {
  const dispatch = useDispatch();
  const [search, setSearch] = useState(null);
  const [selectedTestScenario, setSelectedTestScenario] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const {
    testscenarios,
    isFirstTestScenario,
    showMessage,
    message,
    error: errorMessage,
    isError,
    loading
  } = useSelector((state) => state.testscenario);
  const { project, scenario, changeTestScenario } = props;
  useEffect(() => {
    if (project?.id) {
      fetchTestScenarios();
      if (scenario?.id) {
        dispatch(fetchTestCaseList(project?.id, scenario?.id));
      }
    }
  }, [project, scenario]);

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

  const handleDeleteTestScenario = () => {
    if (project?.id && selectedTestScenario?.id) {
      dispatch(deleteTestScenario(project?.id, selectedTestScenario.id));
      setShowDeleteDialog(false);
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
    setShowDeleteDialog(false);
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
        <PageTitle>Test Scenarios</PageTitle>
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
            placement="bottom"
          >
            <IconButton
              title="Create"
              icon="DashboardCustomize"
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
              id="first-test-scenario"
              icon="Extension"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create first Test Scenario"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-3 p-2 pr-0">
                {filtered.map((testscenario, index) => (
                  <TestScenarioCard
                    key={index}
                    testscenario={testscenario}
                    projectId={project?.id}
                    openTestScenario={openTestScenario}
                    setSelectedTestScenario={setSelectedTestScenario}
                    setShowCloneDialog={setShowCloneDialog}
                    setShowDeleteDialog={setShowDeleteDialog}
                  />
                ))}
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Test Scenario Not Found" />
                <IconButton title="Refresh" icon="Refresh" onClick={fetchTestScenarios} />
              </Centered>
            )}
          </>
        )}
        {showDeleteDialog && (
          <DeleteItemDialog
            title="Delete Test Scenario"
            question="Are you sure you want to delete the selected test scenario?"
            showDialog={showDeleteDialog}
            onClose={resetState}
            item={selectedTestScenario?.name}
            onDelete={handleDeleteTestScenario}
          />
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
        <CustomAlertDialog
          level={isError ? "warn" : "success"}
          message={message}
          errorMessage={errorMessage}
          showDialog={showMessage}
          onClose={() => {
            fetchTestScenarios();
            dispatch(resetTestScenarioFlags());
          }}
        />
      </PageBody>
    </Page>
  );
}

export default TestScenarioManagement;

const TestScenarioCard = ({ projectId, testscenario, openTestScenario, setSelectedTestScenario, setShowCloneDialog, setShowDeleteDialog }) => {
  const dispatch = useDispatch();

  const { id, name, status, description, createdAt, updatedAt } = testscenario;

  const editTestScenario = () => openTestScenario(testscenario);

  const run = () => dispatch(runTestScenario(projectId, id));

  const cloneTestScenario = () => {
    setSelectedTestScenario(testscenario);
    setShowCloneDialog(true);
  };

  const deleteTestScenario = () => {
    setSelectedTestScenario(testscenario);
    setShowDeleteDialog(true);
  };

  const handleToggle = () => dispatch(updateTestScenario(projectId, id, { name, status: !status }));

  const trimmedName = name?.trim() || "";

  return (
    <DisplayCard
      name={name}
      cardIcon={
        <>
          <div
            className="relative w-12 h-12 m-3 mb-1.5 rounded-full flex justify-center shadow-lg hover:shadow-inner items-center bg-opacity-70 text-center select-none text-white font-medium"
            style={{ backgroundColor: ProjectColors[trimmedName.charAt(0).toLowerCase()] }}
            onClick={editTestScenario}
          >
            {trimmedName.charAt(0).toUpperCase() + trimmedName.charAt(name.length - 1).toUpperCase()}
          </div>
          <p className={`text-slate-500 text-xs break-words select-all rounded px-1 ${status ? "bg-green-200" : "bg-slate-200"}`}>
            {status ? "Active" : "In-Active"}
          </p>
        </>
      }
      actions={
        <div className="flex flex-row mb-0.5 items-center justify-end">
          <Tooltip
            title="Enable/Disable Test Scenario"
            content={
              <p>
                Enable or Disable the <strong>Test Scenario</strong>
              </p>
            }
          >
            <TailwindToggleRenderer path={id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
          </Tooltip>
          {status && (
            <Tooltip
              title="Run Test Scenario"
              content={
                <p>
                  Execute test cases of <strong>Test Scenario</strong>
                </p>
              }
            >
              <IconRenderer
                icon="PlayArrowRounded"
                style={{ fontSize: 20 }}
                className="text-color-0500 hover:text-cds-blue-0500 mx-0.5 cursor-pointer"
                onClick={run}
              />
            </Tooltip>
          )}
          <Tooltip
            title="Clone Test Scenario"
            content={
              <p>
                Clone the <strong>Test Scenario</strong>
              </p>
            }
          >
            <IconRenderer
              icon="FileCopyOutlined"
              style={{ fontSize: 20 }}
              className="text-color-0500 hover:text-cds-blue-0500 mx-0.5 cursor-pointer"
              onClick={cloneTestScenario}
            />
          </Tooltip>
          <Tooltip
            title="Edit Test Scenario"
            content={
              <p>
                View and modify the <strong>Test Scenario</strong> details.
                <br />
                Create network elements, deploy, Simulate and more
              </p>
            }
          >
            <IconRenderer
              icon="ModeEditOutlineOutlined"
              style={{ fontSize: 20 }}
              className="text-color-0500 hover:text-cds-blue-0500 mx-0.5 cursor-pointer"
              onClick={editTestScenario}
            />
          </Tooltip>
          <Tooltip
            title="Delete Test Scenario"
            content={
              <p>
                Permanently purges the <strong>Test Scenario</strong> from system including all backups.
              </p>
            }
          >
            <IconRenderer
              icon="DeleteOutlineTwoTone"
              style={{ fontSize: 20 }}
              className="text-color-0500 hover:text-cds-red-0600 mx-0.5 cursor-pointer"
              onClick={deleteTestScenario}
            />
          </Tooltip>
        </div>
      }
    >
      {createdAt?.length > 0 && (
        <Tooltip title={`Created on ${createdAt}`}>
          <div className="text-slate-500 text-xs break-words select-all">
            <IconRenderer icon="CalendarToday" fontSize="12" className="text-color-0600 pr-0.5" />
            {dayjs(Number(new Date(createdAt).getTime())).fromNow()}
          </div>
        </Tooltip>
      )}
      {updatedAt?.length > 0 && (
        <Tooltip title={`Last Modified on ${updatedAt}`}>
          <div className="text-slate-500 text-xs break-words select-all">
            <IconRenderer icon="CalendarToday" fontSize="12" className="text-color-0600 pr-0.5" />
            {dayjs(Number(new Date(updatedAt).getTime())).fromNow()}
          </div>
        </Tooltip>
      )}
      {description?.length > 0 && (
        <div className="my-0.5 text-slate-500 text-xs break-words pr-2 select-all inline-flex items-center">
          <IconRenderer icon="InfoOutlined" fontSize="12" className="text-color-0600 pr-0.5" />
          <NewlineText text={description} />
        </div>
      )}
    </DisplayCard>
  );
};
