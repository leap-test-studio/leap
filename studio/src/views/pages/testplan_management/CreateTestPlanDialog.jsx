import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

const Model = {
  schema: {
    properties: {
      name: {
        type: "string",
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

function CreateTestPlanDialog({ showDialog, createTestPlan, onClose }) {
  const [data, setData] = React.useState({ name: "" });

  if (!showDialog) return <></>;

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create TestPlan"
      saveTitle="Create"
      onSave={() => {
        createTestPlan(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateTestPlanDialog;
