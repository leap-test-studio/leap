import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

const Model = {
  schema: {
    properties: {
      name: {
        type: "string",
        maxLength: 25,
        description: "Enter Test Suite Title"
      },
      description: {
        type: "string",
        description: "Test Suite Details"
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
        label: "Test Suite Name"
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Test Suite Details",
        options: {
          multi: true,
          isLarge: true
        }
      }
    ]
  }
};

function CloneTestScenarioDialog({ showDialog, cloneTestScenario, onClose, testscenario }) {
  const [data, setData] = React.useState({});
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={`Clone Test Suite from ${testscenario?.name}`}
      saveTitle="Clone"
      onSave={() => {
        cloneTestScenario(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CloneTestScenarioDialog;
