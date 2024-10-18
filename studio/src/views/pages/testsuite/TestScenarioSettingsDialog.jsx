import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { updateTestScenario } from "../../../redux/actions/TestScenarioActions";
import { useHandleClose } from "../hooks";

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
      remark: {
        description: "Tags",
        items: {
          type: "string"
        },
        title: "Tags",
        type: "array"
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
        label: "Enable Scenario?",
        options: {
          toggle: true
        }
      },
      {
        type: "Control",
        label: "Tags",
        scope: "#/properties/remark"
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

function TestScenarioSettingsDialog({ showDialog, project, scenario, onClose, role: { isLeads } = { isLeads: false } }) {
  const dispatch = useDispatch();
  const [data, setData] = React.useState();
  const [setIsChange, handleOnClose] = useHandleClose(onClose);

  useEffect(() => {
    setData(scenario);
    return () => setData();
  }, [showDialog, scenario]);

  const saveProject = () => {
    dispatch(
      updateTestScenario(project.id, scenario?.id, {
        name: data.name,
        description: data.description,
        status: data.status,
        remark: data.remark,
        settings: {
          ...project.settings,
          ...data.settings
        }
      })
    );
    onClose();
  };

  const handleOnChange = ({ data: newdata }) => {
    if (!isEqual(data, newdata)) {
      setIsChange(true);
      setData(newdata);
    }
  };

  if (!showDialog || isEmpty(data)) return <></>;

  return (
    <CustomDialog
      open={showDialog}
      onClose={handleOnClose}
      title={
        <p>
          Test Suite Setting
          <br /> <label className="text-xs">{`ID: ${scenario.id}`}</label>
        </p>
      }
      saveTitle="Save"
      onSave={saveProject}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
      buttonDisabled={!isLeads}
    >
      <TailwindRenderer {...Model} data={data} onChange={handleOnChange} />
    </CustomDialog>
  );
}

export default TestScenarioSettingsDialog;
