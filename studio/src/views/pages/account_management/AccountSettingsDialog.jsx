import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { updateAccount } from "../../../redux/actions/AccountActions";
import { authRoles } from "../../../auth/authRoles";

const Roles = [
  { const: "Manager", title: "Manager" },
  { const: "Lead", title: "Lead" },
  { const: "Engineer", title: "Engineer" }
];

const Model = {
  schema: {
    properties: {
      name: {
        title: "User Name",
        type: "string",
        maxLength: 50,
        description: "Enter User name"
      },
      email: {
        title: "User Email Address",
        type: "string",
        description: "Enter User Email",
        format: "email"
      },
      role: {
        title: "Role",
        type: "string",
        oneOf: Roles
      },
      TenantId: {
        title: "Tenant",
        type: "string"
      }
    },
    required: ["name", "email", "password"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/name"
      },
      {
        type: "Control",
        scope: "#/properties/email",
        options: {
          readOnly: true
        }
      },
      {
        type: "Control",
        scope: "#/properties/role"
      },
      {
        type: "Control",
        scope: "#/properties/TenantId"
      }
    ]
  }
};

function AccountSettingsDialog({ showDialog, account, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = React.useState();
  const { tenants } = useSelector((state) => state.tenant);
  if (tenants?.length > 0) {
    Model.schema.properties.TenantId.oneOf = [{ const: null, title: "Select" }, ...tenants.map((t) => ({ const: t.id, title: t.name }))];
  }

  if (account?.role) {
    if (authRoles.admin.includes(account.role)) {
      Model.schema.properties.role.oneOf = [{ const: "Admin", title: "Admin" }, ...Roles];
    } else {
      Model.schema.properties.role.oneOf = Roles;
    }
  }

  useEffect(() => {
    if (account)
      setData({
        ...account,
        TenantId: account.tenant?.id
      });
    return () => setData();
  }, [account]);

  const saveAccount = () => {
    dispatch(
      updateAccount(account.id, {
        name: data.name,
        role: data.role,
        TenantId: data.TenantId
      })
    );
    onClose();
  };

  if (!showDialog || isEmpty(data)) return <></>;

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={
        <p>
          Account Setting
          <br /> <label className="text-xs">{`ID: ${account.id}`}</label>
        </p>
      }
      saveTitle="Save"
      onSave={saveAccount}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default AccountSettingsDialog;
