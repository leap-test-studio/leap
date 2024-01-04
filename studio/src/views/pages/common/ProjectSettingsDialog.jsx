import React, { useEffect } from "react";
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
      },
      settings: {
        type: "object",
        properties: {
          env: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "string" }
              }
            }
          }
        }
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
      },
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
        scope: "#/properties/settings/properties/env",
        label: "Environmental Variables",
        options: {
          disableExpand: true,
          rowTitle: "",
          detail: {
            type: "HorizontalLayout",
            elements: [
              { type: "Control", scope: "#/properties/key" },
              { type: "Control", scope: "#/properties/value" }
            ]
          }
        }
      }
    ]
  }
};

function ProjectSettingsDialog({ showDialog, project, onClose }) {
  const dispatch = useDispatch(project);
  const [data, setData] = React.useState(project);

  useEffect(() => {
    setData(project);
    return () => setData();
  }, [project]);

  if (!showDialog) return <></>;

  const saveProject = () => {
    dispatch(
      updateProject(project.id, {
        name: data.name,
        description: data.description,
        status: data.status,
        settings: {
          ...project.settings,
          ...data.settings
        }
      })
    );
    onClose();
  };

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={
        <p>
          Project Setting
          <br /> <label className="text-xs">{`ID: ${project.id}`}</label>
        </p>
      }
      saveTitle="Save"
      onSave={saveProject}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default ProjectSettingsDialog;
