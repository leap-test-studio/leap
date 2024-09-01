import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { updateTenant } from "../../../redux/actions/TenantActions";

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

function TenantSettingsDialog({ showDialog, project, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = React.useState();

  useEffect(() => {
    if (isEmpty(data)) {
      setData(project);
    }
    return () => setData();
  }, [project]);

  const saveTenant = () => {
    dispatch(updateTenant(project.id, data));
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
        <p>
          Tenant Setting
          <br /> <label className="text-xs">{`ID: ${project.id}`}</label>
        </p>
      }
      saveTitle="Save"
      onSave={saveTenant}
      customWidth="w-[50vw]"
      customHeight="w-[50vh]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default TenantSettingsDialog;
