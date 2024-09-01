import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import CreateTestPlanDialog from "./CreateTestPlanDialog";
import TestPlanSettingsDialog from "./TestPlanSettingsDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";

import { createTestPlan, fetchTestPlanList, deleteTestPlan, resetTestPlanFlags, updateTestPlan } from "../../../redux/actions/TestPlanActions";
import LocalStorageService from "../../../redux/actions/LocalStorageService";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, IconRenderer } from "../../utilities";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import TestCaseSequencer from "../sequencer";
import ProgressIndicator from "../common/ProgressIndicator";

dayjs.extend(relativeTime);

let intervalId;
const TestPlanManagement = (props) => {
  const AuthUser = LocalStorageService.getItem("auth_user");
  const dispatch = useDispatch();
  const { project, pageTitle } = props;
  const { showMessage, message, details, isFirstTestPlan, loading, testplans } = useSelector((state) => state.testplan);
  const [search, setSearch] = useState("");
  const [selectedTestPlan, setSelectedTestPlan] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (intervalId) clearInterval(intervalId);
    fetchList();
    intervalId = setInterval(fetchList, 15000);
    return () => clearInterval(intervalId);
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
          dispatch(resetTestPlanFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const fetchList = useCallback(() => !showEditor && dispatch(fetchTestPlanList(project?.id)), [showEditor, project]);

  const handleCreateTestPlan = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createTestPlan(project?.id, payload));
  };

  const openPlanner = (plan) => {
    setSelectedTestPlan(plan);
    setShowEditor(true);
  };

  const openSettings = (plan) => {
    setSelectedTestPlan(plan);
    setSettingsDialog(true);
  };

  const filtered = useMemo(() => {
    if (!search) return testplans;
    const searchText = search.toLowerCase();
    return testplans.filter((s) => s.name.toLowerCase().includes(searchText));
  }, [testplans, search]);

  if (showEditor)
    return (
      <TestCaseSequencer
        {...props}
        testPlan={selectedTestPlan}
        pageTitle={"Test Plan: " + selectedTestPlan?.name}
        onClose={() => setShowEditor(false)}
      />
    );

  return (
    <Page>
      <PageHeader show={!isFirstTestPlan}>
        <PageTitle>{`${pageTitle} (${testplans.length})`}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Test Plan" show={loading} />
          <RoundedIconButton
            id="refresh-testplans"
            tooltip="Refresh Test Plans"
            color="bg-color-0600 hover:bg-color-0500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent search={search} placeholder="Search for Test Plan" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <IconButton
            id="testplan-create-btn"
            title="Create"
            icon="AddCircle"
            onClick={() => setShowCreateDialog(true)}
            tooltip="Create New Test Plan"
          />
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstTestPlan ? (
          <Centered>
            <FirstTimeCard
              id="first-time-test-plan"
              icon="LibraryBooksTwoTone"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Test Plan"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {testplans && filtered.length > 0 ? (
              <div className="relative w-full">
                <CardHeaders
                  items={[
                    { colSpan: 5, label: "Test Plan" },
                    { colSpan: 4, label: "Info" },
                    { colSpan: 1, label: "Status" },
                    { colSpan: 2, label: "Actions" }
                  ]}
                />
                <div className="grid grid-cols-1 gap-y-2.5 pr-0">
                  {filtered.map((testplan, index) => (
                    <TestPlanCard
                      key={index}
                      {...props}
                      testplan={testplan}
                      openPlanner={openPlanner}
                      openSettings={openSettings}
                      activeUser={AuthUser}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Test Plan Not Found" />
                <IconButton id="testplan-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} tooltip="Fetch Test Plans" />
              </Centered>
            )}
          </>
        )}

        <CreateTestPlanDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createTestPlan={handleCreateTestPlan} />
        <TestPlanSettingsDialog {...props} showDialog={showSettingsDialog} onClose={() => setSettingsDialog(false)} testplan={selectedTestPlan} />
      </PageBody>
    </Page>
  );
};

export default TestPlanManagement;

const TestPlanCard = ({ testplan, activeUser, openPlanner, openSettings }) => {
  const dispatch = useDispatch();
  const { id, name, description, createdAt, updatedAt } = testplan;
  const status = true;

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Test Plan?`,
      text: `Test Plan Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: `${status ? "red" : "green"}`,
      cancelButtonColor: `${status ? "green" : "red"}`
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(
          updateTestPlan(id, {
            name,
            status: !status
          })
        );
      }
    });
  };

  const labels = [];

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

  const handleSettings = () => openSettings(testplan);

  const handleOpenPlanner = () => openPlanner(testplan);

  const handleDeletePlan = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Test Plan?",
      text: `Test Plan: ${name}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: "red",
      cancelButtonColor: "green"
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(deleteTestPlan(id));
      }
    });
  };

  return (
    <DisplayCard
      id={id}
      name={name}
      description={description}
      status={status}
      actions={
        <>
          {id !== activeUser?.id && (
            <Tooltip
              title={
                <p>
                  Enable or Disable the <strong>Test Plan</strong>
                </p>
              }
            >
              <TailwindToggleRenderer small={true} path={"status-" + id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
            </Tooltip>
          )}
          <ActionButton
            icon="Settings"
            onClick={handleSettings}
            tooltip="Open Test Plan Settings"
            description={
              <p>
                View and modify the <strong>Test Plan Settings</strong>.
              </p>
            }
          />

          <ActionButton
            icon="ModeEdit"
            onClick={handleOpenPlanner}
            tooltip="Open Test Planner"
            description={
              <p>
                View or modify the <strong>Test Planner</strong>.
              </p>
            }
          />
          {id !== activeUser?.id && (
            <ActionButton
              icon="Delete"
              className="hover:text-cds-red-0800"
              onClick={handleDeletePlan}
              tooltip="Delete Test Planner"
              description={
                <p>
                  Permanently purges the <strong>Test Plan</strong> from system.
                </p>
              }
            />
          )}
        </>
      }
      records={labels}
    />
  );
};
