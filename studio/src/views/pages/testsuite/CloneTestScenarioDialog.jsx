import React from "react";
import CustomDialog from "../../utilities/CustomDialog";
import TailwindRenderer from "../../tailwindrender";

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

function CloneTestScenarioDialog({ showDialog, cloneTestScenario, onClose, testscenario }) {
  const [data, setData] = React.useState({});
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={`Clone Test scenario from ${testscenario?.name}`}
      saveTitle="Clone"
      onSave={() => {
        console.log(data);
        cloneTestScenario(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CloneTestScenarioDialog;
