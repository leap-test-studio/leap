import React from "react";
import TailwindRenderer from "@tailwindrender/.";

import { CustomDialog } from "@utilities/.";

const Model = {
  schema: {
    properties: {
      name: {
        type: "string",
        minLength: 4,
        maxLength: 25,
        description: "Enter name"
      },
      description: {
        type: "string",
        description: "Enter description"
      }
    },
    required: ["name"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/name",
        label: "Name"
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Description",
        options: {
          multi: true
        }
      }
    ]
  }
};

function CreateWorkflowDialog({ showDialog, createWorkflow, onClose }) {
  const [data, setData] = React.useState({ name: "" });
  const [isValid, setValid] = React.useState(false);

  if (!showDialog) return <></>;

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create Workflow"
      saveTitle="Create"
      onSave={() => {
        createWorkflow(data);
        setData({});
      }}
      buttonDisabled={!isValid}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} isValid={setValid} />
    </CustomDialog>
  );
}

export default CreateWorkflowDialog;
