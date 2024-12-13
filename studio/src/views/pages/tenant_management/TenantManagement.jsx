import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import React, { useCallback, useEffect, useState } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, Spinner } from "@utilities/.";
import { createTenant, fetchTenantList, deleteTenant, resetTenantFlags, updateTenant } from "@redux-actions/.";
import LocalStorageService from "@redux-actions/LocalStorageService";

import { PageHeader, Page, PageActions, PageBody, PageTitle, PageListCount } from "../common/PageLayoutComponents";
import CreateTenantDialog from "./CreateTenantDialog";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import FirstTimeCard from "../common/FirstTimeCard";
import ProgressIndicator from "../common/ProgressIndicator";
import TenantSettingsDialog from "./TenantSettingsDialog";

dayjs.extend(relativeTime);

let intervalId;
const TenantManagement = (props) => {
  const dispatch = useDispatch();
  const UserInfo = LocalStorageService.getUserInfo();
  const { pageTitle } = props;
  const { showMessage, message, details, isFirstTenant, loading, tenants, listLoading } = useSelector((state) => state.tenant);

  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const searchText = search?.toLowerCase() || "";
    setFiltered(
      isEmpty(searchText)
        ? tenants
        : tenants.filter(
            (s) =>
              s.id.toLowerCase().includes(searchText) ||
              s.name.toLowerCase().includes(searchText) ||
              s.description?.toLowerCase().includes(searchText)
          )
    );
  }, [search, tenants]);

  const fetchList = useCallback(() => {
    if (!listLoading) {
      dispatch(fetchTenantList());
    }
  }, [listLoading]);

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
        width: 550,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetTenantFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const handleCreateTenant = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createTenant(payload));
  };

  const handleCardAction = (action) => {
    if (action) {
      setSelectedTenant(action.tenant);

      if (action.showCreateDialog) {
        setShowCreateDialog(!showCreateDialog);
      } else if (action.showDeleteDialog) {
        setShowDeleteDialog(!showDeleteDialog);
      } else if (action.showCloneDialog) {
        setShowCloneDialog(!showCloneDialog);
      } else if (action.showSettingsDialog) {
        setSettingsDialog(!showSettingsDialog);
      }
    }
  };

  return (
    <Page>
      <PageHeader show={!isFirstTenant}>
        <PageTitle>
          <PageListCount pageTitle={pageTitle} count={tenants.length} listLoading={listLoading} />
        </PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Tenant" show={loading} />
          <RoundedIconButton
            id="refresh-tenants"
            tooltip="Refresh Tenants"
            color="bg-color-0600 hover:bg-color-500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent placeholder="Search for Tenant" onChange={setSearch} />
          <IconButton id="tenant-create-btn" title="Create" icon="AddCircle" onClick={() => setShowCreateDialog(true)} tooltip="Create New Tenant" />
        </PageActions>
      </PageHeader>
      <PageBody>
        {tenants.length == 0 && listLoading ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : isFirstTenant ? (
          <Centered>
            <FirstTimeCard
              id="first-time-project"
              icon="SnippetFolder"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Tenant"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {tenants && filtered.length > 0 ? (
              <div className="relative w-full">
                <CardHeaders
                  items={[
                    { colSpan: 5, label: "Tenant" },
                    { colSpan: 4, label: "Info" },
                    { colSpan: 1, label: "Status" },
                    { colSpan: 2, label: "Actions" }
                  ]}
                />
                <div className="grid grid-cols-1 gap-y-2.5 pr-0">
                  {filtered.map((tenant, index) => (
                    <TenantCard key={index} {...props} tenant={tenant} handleAction={handleCardAction} activeUser={UserInfo} />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Tenant Not Found" />
                <IconButton id="tenant-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} tooltip="Fetch Tenants" />
              </Centered>
            )}
          </>
        )}

        <CreateTenantDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createTenant={handleCreateTenant} />
        <TenantSettingsDialog showDialog={showSettingsDialog} onClose={() => setSettingsDialog(false)} project={selectedTenant} />
      </PageBody>
    </Page>
  );
};

export default TenantManagement;

const TenantCard = ({ tenant, handleAction, activeUser }) => {
  const dispatch = useDispatch();
  const { id, name, description, createdAt, updatedAt } = tenant;
  const status = true;

  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Tenant?`,
      text: `Tenant Id: ${id}`,
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
        dispatch(
          updateTenant(id, {
            name,
            status: !status
          })
        );
      }
    });
  };

  let labels = [
    {
      icon: "Fingerprint",
      tooltip: `Tenant ID ${id}`,
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

  const handleTenantSettings = () =>
    handleAction({
      tenant,
      showSettingsDialog: true
    });

  const handleTenantDelete = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Tenant?",
      text: `Tenant: ${name}`,
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
        dispatch(deleteTenant(id));
      }
    });
  };

  return (
    <DisplayCard
      name={name}
      description={description}
      status={status}
      actions={
        <div className="inline-flex items-center space-x-2">
          {id !== activeUser?.id && (
            <Tooltip
              title={
                <p>
                  Enable or Disable the <strong>Tenant</strong>
                </p>
              }
            >
              <TailwindToggleRenderer small={true} path={"status-" + id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
            </Tooltip>
          )}
          <ActionButton
            icon="Settings"
            onClick={handleTenantSettings}
            tooltip="Tenant Settings"
            description={
              <p>
                View and modify the <strong>Tenant Settings</strong>.
              </p>
            }
          />
          {id !== activeUser?.id && (
            <ActionButton
              icon="Delete"
              className="group-hover:text-red-500"
              onClick={handleTenantDelete}
              tooltip="Delete Tenant"
              description={
                <p>
                  Permanently purges the <strong>Tenant</strong> from system.
                </p>
              }
            />
          )}
        </div>
      }
      records={labels}
    />
  );
};
