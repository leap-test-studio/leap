import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { useSelector } from "react-redux";

const Model = {
  schema: {
    properties: {
      fname: {
        title: "User First Name",
        type: "string",
        maxLength: 25,
        description: "Enter First name"
      },
      lname: {
        title: "User Last Name",
        type: "string",
        maxLength: 25,
        description: "Enter Last name"
      },
      email: {
        title: "User Email Address",
        type: "string",
        description: "Enter User Email",
        format: "email"
      },
      password: {
        title: "Password",
        type: "string",
        description: "Enter User Password",
        format: "password"
      },
      role: {
        title: "Role",
        type: "string",
        oneOf: [
          { const: "Manager", title: "Manager" },
          { const: "Lead", title: "Lead" },
          { const: "Engineer", title: "Engineer" }
        ]
      },
      TenantId: {
        title: "Tenant",
        type: "string"
      }
    },
    required: ["fname", "email", "password"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "HorizontalLayout",
        elements: [
          {
            type: "Control",
            scope: "#/properties/fname"
          },
          {
            type: "Control",
            scope: "#/properties/lname"
          }
        ]
      },
      {
        type: "Control",
        scope: "#/properties/email"
      },
      {
        type: "Control",
        scope: "#/properties/password"
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

function CreateAccountDialog({ showDialog, createAccount, onClose }) {
  const [data, setData] = React.useState({ name: "" });
  const { tenants } = useSelector((state) => state.tenant);
  if (!showDialog) return <></>;
  if (tenants?.length > 0) {
    Model.schema.properties.TenantId.oneOf = tenants.map((t) => ({ const: t.id, title: t.name }));
  }
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create Account"
      saveTitle="Create"
      onSave={() => {
        createAccount({
          ...data,
          name: `${data.fname}${data.lname != null ? " " + data.lname : ""}`,
          confirmPassword: data.password,
          acceptTerms: true
        });
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateAccountDialog;
