import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "@tailwindrender/.";

import { CustomDialog } from "@utilities/.";
import { updateWorkflow } from "@redux-actions/WorkflowActions";

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
      type: {
        type: "integer",
        oneOf: [
          { const: 0, title: "Webhook" },
          { const: 1, title: "Schedule" }
        ]
      },
      cron: {
        type: "string"
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
        scope: "#/properties/type",
        label: "Trigger Type",
        options: {
          format: "radio"
        }
      },
      {
        type: "Control",
        scope: "#/properties/cron",
        label: "Schedule Cron",
        options: {
          format: "cron"
        },
        rule: {
          effect: "SHOW",
          condition: {
            type: "LEAF",
            scope: "#/properties/type",
            expectedValue: 1
          }
        }
      }
    ]
  }
};

function WorkflowSettingsDialog({ project, showDialog, workflow, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = React.useState();

  useEffect(() => {
    if (isEmpty(data)) {
      setData(workflow);
    }
    return () => setData();
  }, [workflow]);

  const saveWorkflow = () => {
    dispatch(
      updateWorkflow(workflow.id, {
        ProjectMasterId: project?.id,
        name: data.name,
        description: data.description || "-",
        type: data.type,
        cron: data.cron || "-"
      })
    );
    onClose();
  };

  if (!showDialog || isEmpty(data)) return <></>;
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={
        <div className="flex flex-col">
          <span>Workflow Setting</span>
          <span className="text-xs select-all cursor-pointer">{`ID: ${workflow.id}`}</span>
        </div>
      }
      saveTitle="Save"
      onSave={saveWorkflow}
      customWidth="w-[30vw]"
      customHeight="w-[50vh]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default WorkflowSettingsDialog;
