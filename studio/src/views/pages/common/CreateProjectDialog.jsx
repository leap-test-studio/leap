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

function CreateProjectDialog({ showDialog, createProject, onClose }) {

  const [data, setData] = React.useState({ name: "" });

  if (!showDialog) return;

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create Project"
      saveTitle="Create"
      onSave={() => {
        createProject(data);
        setData({});
      }}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateProjectDialog;
