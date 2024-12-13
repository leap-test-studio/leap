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
        description: "Enter Test Suite Title"
      },
      description: {
        type: "string",
        description: "Suite Description"
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
        label: "Suite Name"
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Suite Description",
        options: {
          multi: true,
          isLarge: true
        }
      }
    ]
  }
};

function CreateTestScenarioDialog({ showDialog, createTestScenario, onClose }) {
  const [data, setData] = React.useState({});
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create Test Suite"
      saveTitle="Create"
      onSave={() => {
        createTestScenario(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateTestScenarioDialog;
