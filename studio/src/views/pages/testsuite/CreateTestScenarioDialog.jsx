import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

const Model = {
  schema: {
    properties: {
      name: {
        type: "string",
        maxLength: 25,
        description: "Enter Test Scenario Title"
      },
      description: {
        type: "string",
        description: "Test Scenario"
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
        label: "Test Scenario Name"
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Test Scenario",
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
      title="Create Test Scenario"
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
