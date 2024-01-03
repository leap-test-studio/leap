import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

import CustomDialog from "../../utilities/CustomDialog";
import TailwindRenderer from "../../tailwindrender";
import { updateProject } from "../../../redux/actions/ProjectActions";

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
      },
      status: {
        type: "boolean",
        default: true
      }
    },
    required: ["name"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/status",
        label: "Enable Project?",
        options: {
          toggle: true
        }
      },
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

function ProjectSettingsDialog({ showDialog, project, onClose }) {
  if (!showDialog) return;
  const dispatch = useDispatch(project);
  const [data, setData] = React.useState(project);
  useEffect(() => {
    setData(project);
    return () => setData();
  }, [project]);

  const saveProject = useCallback(() => {
    dispatch(
      updateProject(project.id, {
        name: data.name,
        description: data.description,
        status: data.status
      })
    );
    onClose();
  });

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Project Settings"
      saveTitle="Save"
      onSave={saveProject}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default ProjectSettingsDialog;
