import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import CreateTenantDialog from "./CreateTenantDialog";
import TenantSettingsDialog from "./TenantSettingsDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";

import { createTenant, fetchTenantList, deleteTenant, resetTenantFlags, updateTenant } from "../../../redux/actions/TenantActions";
import LocalStorageService from "../../../redux/actions/LocalStorageService";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, IconRenderer } from "../../utilities";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import ProgressIndicator from "../common/ProgressIndicator";

dayjs.extend(relativeTime);

let intervalId;
const TenantManagement = (props) => {
  const AuthUser = LocalStorageService.getItem("auth_user");
  const dispatch = useDispatch();
  const { pageTitle } = props;
  const { showMessage, message, details, isFirstTenant, loading, tenants } = useSelector((state) => state.tenant);

  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);

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
          dispatch(resetTenantFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const fetchList = () => dispatch(fetchTenantList());

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

  const searchText = search.toLowerCase();
  const filtered = tenants.filter((s) => s.name.toLowerCase().includes(searchText) || s.email.toLowerCase().includes(searchText));

  return (
    <Page>
      <PageHeader show={!isFirstTenant}>
        <PageTitle>{`${pageTitle} (${tenants.length})`}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Tenant" show={loading} />
          <RoundedIconButton
            id="refresh-tenants"
            tooltip="Refresh Tenants"
            color="bg-color-0600 hover:bg-color-0500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent search={search} placeholder="Search for Tenant" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <IconButton id="tenant-create-btn" title="Create" icon="AddCircle" onClick={() => setShowCreateDialog(true)} tooltip="Create New Tenant" />
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstTenant ? (
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
                    <TenantCard key={index} {...props} tenant={tenant} handleAction={handleCardAction} activeUser={AuthUser} />
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
      cancelButtonColor: `${status ? "green" : "red"}`
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
      cancelButtonColor: "green"
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
        <>
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
              className="text-red-600 hover:text-red-500"
              onClick={handleTenantDelete}
              tooltip="Delete Tenant"
              description={
                <p>
                  Permanently purges the <strong>Tenant</strong> from system.
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
