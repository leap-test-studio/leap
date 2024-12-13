import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import Swal from "sweetalert2";

import TailwindRenderer from "@tailwindrender/.";
import { useHandleClose } from "@hooks/.";
import { CustomDialog } from "@utilities/.";
import { startProjectBuilds } from "@redux-actions/.";

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
        label: "Name",
        options: {
          readonly: true
        }
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Description",
        options: {
          multi: true,
          readonly: true
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
              {
                type: "Control",
                scope: "#/properties/key"
              },
              { type: "Control", scope: "#/properties/value" }
            ]
          }
        }
      }
    ]
  }
};

function ProjectExecutionDialog({ showDialog, project, onClose, role: { isLeads } = { isLeads: false } }) {
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [setIsChange, handleOnClose] = useHandleClose(onClose);

  useEffect(() => {
    setData(project);
    return () => setData();
  }, [project]);

  const startProjectExecution = () => {
    Swal.fire({
      title: "Start Project Execution?",
      text: `Project Id: ${project.id}`,
      icon: "question",
      confirmButtonText: "YES",
      showDenyButton: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((response) => {
      if (response.isConfirmed) {
        dispatch(startProjectBuilds(project.id, { env: data.settings?.env || [] }));
      }
    });
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
          Project Execution Settings
          <br /> <label className="text-xs">{`ID: ${project.id}`}</label>
        </p>
      }
      saveIcon="RocketLaunch"
      saveTitle="Start"
      onSave={startProjectExecution}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
      buttonDisabled={!isLeads}
    >
      <TailwindRenderer {...Model} data={data} onChange={handleOnChange} />
    </CustomDialog>
  );
}

export default ProjectExecutionDialog;
