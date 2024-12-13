// THIRD-PARTY-MODULES
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";

// INTERNAL-MODULES
import { RoleGroups } from "engine_utils";
import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";
import { Centered, IconButton, Tooltip, EmptyIconRenderer, RoundedIconButton, SearchComponent, Spinner } from "@utilities/.";
import { createAccount, fetchAccountList, deleteAccount, resetAccountFlags, updateAccount, fetchTenantList } from "@redux-actions/.";
import LocalStorageService from "@redux-actions/LocalStorageService";

// LOCAL
import AccountSettingsDialog from "./AccountSettingsDialog";
import CreateAccountDialog from "./CreateAccountDialog";
import { PageHeader, Page, PageActions, PageBody, PageTitle, PageListCount } from "../common/PageLayoutComponents";
import DisplayCard, { ActionButton, CardHeaders } from "../common/DisplayCard";
import FirstTimeCard from "../common/FirstTimeCard";
import ProgressIndicator from "../common/ProgressIndicator";

dayjs.extend(relativeTime);

let intervalId;
const AccountManagement = (props) => {
  const UserInfo = LocalStorageService.getUserInfo();
  const dispatch = useDispatch();
  const { pageTitle } = props;
  const { showMessage, message, details, isFirstAccount, loading, accounts, listLoading } = useSelector((state) => state.account);

  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showSettingsDialog, setSettingsDialog] = useState(false);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const searchText = search?.toLowerCase() || "";
    setFiltered(
      isEmpty(searchText) ? accounts : accounts.filter((s) => s.name.toLowerCase().includes(searchText) || s.email.toLowerCase().includes(searchText))
    );
  }, [search, accounts]);

  const fetchList = useCallback(() => {
    if (!listLoading) {
      dispatch(fetchAccountList());
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
          dispatch(resetAccountFlags());
          fetchList();
        }
      });
    }
  }, [showMessage]);

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

  return (
    <Page>
      <PageHeader show={!isFirstAccount}>
        <PageTitle>
          <PageListCount pageTitle={pageTitle} count={accounts.length} listLoading={listLoading} />
        </PageTitle>
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
          <SearchComponent placeholder="Search for Account" onChange={setSearch} />
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
        {listLoading && accounts.length == 0 ? (
          <Centered>
            <Spinner>Loading</Spinner>
          </Centered>
        ) : isFirstAccount ? (
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
                    <AccountCard key={index} {...props} account={account} handleAction={handleCardAction} activeUser={UserInfo} />
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
      cancelButtonColor: `${status ? "green" : "red"}`,
      allowEscapeKey: false,
      allowOutsideClick: false
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
      cancelButtonColor: "green",
      allowEscapeKey: false,
      allowOutsideClick: false
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
        <div className="inline-flex items-center space-x-2">
          <Tooltip
            title={
              <p>
                Enable or Disable the <strong>Account</strong>
              </p>
            }
          >
            <TailwindToggleRenderer
              small={true}
              path={"status-" + id}
              visible={true}
              enabled={id !== activeUser?.id}
              data={status}
              handleChange={handleToggle}
            />
          </Tooltip>
          <ActionButton
            icon="Settings"
            disabled={id === activeUser?.id && !RoleGroups.Admins.includes(role)}
            onClick={handleSettings}
            tooltip="Account Settings"
            description={
              <p>
                View and modify the <strong>Account Settings</strong>.
              </p>
            }
          />
          <ActionButton
            icon="Delete"
            disabled={id === activeUser?.id}
            className="group-hover:text-red-500"
            onClick={handleAccountDelete}
            tooltip="Delete Account"
            description={
              <p>
                Permanently purges the <strong>Account</strong> from system.
              </p>
            }
          />
        </div>
      }
      records={labels}
    />
  );
};
