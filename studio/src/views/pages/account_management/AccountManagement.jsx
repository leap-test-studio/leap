import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

import FirstTimeCard from "../common/FirstTimeCard";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import CreateAccountDialog from "./CreateAccountDialog";
import AccountSettingsDialog from "./AccountSettingsDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "../common/PageLayoutComponents";

import { createAccount, fetchAccountList, deleteAccount, resetAccountFlags, updateAccount } from "../../../redux/actions/AccountActions";
import LocalStorageService from "../../../redux/actions/LocalStorageService";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, IconRenderer } from "../../utilities";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import { fetchTenantList } from "../../../redux/actions/TenantActions";
import { authRoles } from "../../../auth/authRoles";
import ProgressIndicator from "../common/ProgressIndicator";

dayjs.extend(relativeTime);

let intervalId;
const AccountManagement = (props) => {
  const AuthUser = LocalStorageService.getItem("auth_user");
  const dispatch = useDispatch();
  const { pageTitle } = props;
  const { showMessage, message, details, isFirstAccount, loading, accounts } = useSelector((state) => state.account);

  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState();
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
          dispatch(resetAccountFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

  const fetchList = () => {
    dispatch(fetchAccountList());
    dispatch(fetchTenantList());
  };

  const handleCreateAccount = (payload) => {
    setShowCreateDialog(!showCreateDialog);
    dispatch(createAccount(payload));
  };

  const handleCardAction = (action) => {
    if (action) {
      setSelectedAccount(action.account);

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
  const filtered = accounts.filter((s) => s.name.toLowerCase().includes(searchText) || s.email.toLowerCase().includes(searchText));

  return (
    <Page>
      <PageHeader show={!isFirstAccount}>
        <PageTitle>{`${pageTitle} (${accounts.length})`}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Creating Account" show={loading} />
          <RoundedIconButton
            id="refresh-accounts"
            tooltip="Refresh Accounts"
            color="bg-color-0600 hover:bg-color-0500"
            size="18"
            icon="Refresh"
            onClick={fetchList}
          />
          <SearchComponent search={search} placeholder="Search for Account" onChange={(ev) => setSearch(ev)} onClear={() => setSearch("")} />
          <IconButton
            id="account-create-btn"
            title="Create"
            icon="AddCircle"
            onClick={() => setShowCreateDialog(true)}
            tooltip="Create New Account"
          />
        </PageActions>
      </PageHeader>
      <PageBody>
        {isFirstAccount ? (
          <Centered>
            <FirstTimeCard
              id="first-time-project"
              icon="SnippetFolder"
              loading={loading}
              onClick={() => setShowCreateDialog(true)}
              title="Create First Account"
              buttonTitle="Create"
              buttonIcon="PostAdd"
            />
          </Centered>
        ) : (
          <>
            {accounts && filtered.length > 0 ? (
              <div className="relative w-full">
                <CardHeaders
                  items={[
                    { colSpan: 5, label: "Account" },
                    { colSpan: 4, label: "Info" },
                    { colSpan: 1, label: "Status" },
                    { colSpan: 2, label: "Actions" }
                  ]}
                />
                <div className="grid grid-cols-1 gap-y-2.5 pr-0">
                  {filtered.map((account, index) => (
                    <AccountCard key={index} {...props} account={account} handleAction={handleCardAction} activeUser={AuthUser} />
                  ))}
                </div>
              </div>
            ) : (
              <Centered>
                <EmptyIconRenderer title="Account Not Found" />
                <IconButton id="account-refresh-btn" title="Refresh" icon="Refresh" onClick={fetchList} tooltip="Fetch Accounts" />
              </Centered>
            )}
          </>
        )}

        <CreateAccountDialog showDialog={showCreateDialog} onClose={() => setShowCreateDialog(false)} createAccount={handleCreateAccount} />
        <AccountSettingsDialog showDialog={showSettingsDialog} onClose={() => setSettingsDialog(false)} account={selectedAccount} />
      </PageBody>
    </Page>
  );
};

export default AccountManagement;

const AccountCard = ({ account, handleAction, activeUser }) => {
  const dispatch = useDispatch();
  const { id, name, email, role, created, updated, tenant } = account;
  const status = true;
  const handleToggle = () => {
    Swal.fire({
      title: `Are you sure you want to ${status ? "De-Activate" : "Activate"} Account?`,
      text: `Account Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: `${status ? "red" : "green"}`,
      cancelButtonColor: `${status ? "green" : "red"}`
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(
          updateAccount(id, {
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
      tooltip: `Account ID ${id}`,
      prefix: "ID",
      element: id
    }
  ];

  if (role?.length > 0) {
    labels.push({
      icon: "Badge",
      tooltip: `Active Role is ${role}`,
      prefix: "Role",
      element: role
    });
  }

  if (tenant?.name?.length > 0) {
    labels.push({
      icon: "Engineering",
      tooltip: `Tenant Name is ${tenant?.name}`,
      prefix: "Tenant",
      element: tenant?.name
    });
  }

  if (created?.length > 0) {
    labels.push({
      icon: "Event",
      tooltip: `Created on ${new Date(created)?.toUTCString()}`,
      prefix: "Created on",
      element: dayjs(Number(new Date(created).getTime())).fromNow()
    });
  }
  if (updated?.length > 0) {
    labels.push({
      icon: "AccessTime",
      tooltip: `Modified on ${new Date(updated)?.toUTCString()}`,
      prefix: "Modified on",
      element: dayjs(Number(new Date(updated).getTime())).fromNow()
    });
  }

  const handleSettings = () =>
    handleAction({
      account,
      showSettingsDialog: true
    });

  const handleAccountDelete = () => {
    Swal.fire({
      title: "Are you sure you want to Delete Account?",
      text: `Account Id: ${id}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "YES",
      cancelButtonText: "NO",
      confirmButtonColor: "red",
      cancelButtonColor: "green"
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(deleteAccount(id));
      }
    });
  };

  return (
    <DisplayCard
      name={name}
      description={email}
      status={status}
      actions={
        <>
          {id !== activeUser?.id && role != authRoles.admin && (
            <Tooltip
              title={
                <p>
                  Enable or Disable the <strong>Account</strong>
                </p>
              }
            >
              <TailwindToggleRenderer small={true} path={"status-" + id} visible={true} enabled={true} data={status} handleChange={handleToggle} />
            </Tooltip>
          )}
          {role != authRoles.admin && (
            <ActionButton
              icon="Settings"
              onClick={handleSettings}
              tooltip="Account Settings"
              description={
                <p>
                  View and modify the <strong>Account Settings</strong>.
                </p>
              }
            />
          )}
          {id !== activeUser?.id && role != authRoles.admin && (
            <ActionButton
              icon="Delete"
              className="text-red-600 hover:text-red-500"
              onClick={handleAccountDelete}
              tooltip="Delete Account"
              description={
                <p>
                  Permanently purges the <strong>Account</strong> from system.
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
