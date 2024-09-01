import { useState } from "react";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

import { RequestSchemas, RequestUISchemas } from "./NodeUtils";
import { useSelector } from "react-redux";

function UpdateNodeConfigDialog({ isOpen, onClose, selectedNode, onUpdate }) {
  const [nodeData, setNodeData] = useState(
    selectedNode?.data
      ? {
          conditions: [],
          ...selectedNode?.data
        }
      : {}
  );
  const [disableSave, setDisableSave] = useState(false);
  const schema = RequestSchemas[selectedNode?.type];
  const uischema = RequestUISchemas[selectedNode?.type];
  const { testcases } = useSelector((state) => state.project);

  if (schema.properties?.conditions?.items?.properties?.fallback) {
    if (!isEmpty(testcases))
      schema.properties.conditions.items.properties.fallback.oneOf = Object.values(testcases).map((n) => ({
        const: n.id,
        title: n.label || n.data.name
      }));
  }

  return (
    <CustomDialog
      open={isOpen}
      onClose={onClose}
      title={
        <div className="text-sm font-bold text-color-label py-0">
          Setting
          <div className="inline-flex text-xs text-slate-400 justify-start items-center mx-2">
            <span className="select-none">{selectedNode?.type} #ID:</span>
            <span className="inline-flex">
              <p className="select-none">[</p>
              <p className="select-all px-1">{selectedNode?.id}</p>
              <p className="select-none">]</p>
            </span>
          </div>
        </div>
      }
      saveTitle="Save"
      buttonDiabled={disableSave}
      onSave={() =>
        onUpdate({
          ...selectedNode,
          data: nodeData
        })
      }
      customWidth="w-[40vw]"
      customHeight="h-[20vh]"
    >
      <TailwindRenderer
        schema={schema}
        uischema={uischema}
        data={nodeData}
        onChange={({ errors, data }) => {
          setDisableSave(!isEmpty(errors));
          if (!isEqual(nodeData, data)) {
            setNodeData(data);
          }
        }}
      />
    </CustomDialog>
  );
}

export default UpdateNodeConfigDialog;
