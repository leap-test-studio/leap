import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { updateTestPlan } from "../../../redux/actions/TestPlanActions";

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

function TestPlanSettingsDialog({ project, showDialog, testplan, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = React.useState();

  useEffect(() => {
    if (isEmpty(data)) {
      setData(testplan);
    }
    return () => setData();
  }, [testplan]);

  const saveTestPlan = () => {
    dispatch(
      updateTestPlan(testplan.id, {
        ProjectMasterId: project?.id,
        name: data.name,
        description: data.description,
        type: data.type,
        cron: data.cron
      })
    );
    onClose();
  };

  if (!showDialog || isEmpty(data)) return <></>;
  console.log(data);
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title={
        <p>
          Test Plan Setting
          <br /> <label className="text-xs">{`ID: ${testplan.id}`}</label>
        </p>
      }
      saveTitle="Save"
      onSave={saveTestPlan}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default TestPlanSettingsDialog;
