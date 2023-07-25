import React from "react";
import CustomDialog from "../../utilities/CustomDialog";
import TailwindRenderer from "../../tailwindrender";

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

function CreateTestSuiteDialog({ showDialog, createTestSuite, onClose }) {
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
        createTestSuite(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateTestSuiteDialog;
