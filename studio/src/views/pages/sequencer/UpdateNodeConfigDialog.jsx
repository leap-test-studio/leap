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

  if (schema.properties?.conditions?.items?.properties?.fallback) {
    const {
      settings: { edges, nodes }
    } = useSelector((state) => state.project);
    const nextNodes = edges && nodes ? edges.filter((e) => e.source === selectedNode?.id).map((e) => nodes.find((n) => n.id == e.target)) : [];
    if (nextNodes?.length > 0)
      schema.properties.conditions.items.properties.fallback.oneOf = nextNodes.map((n) => ({ const: n.id, title: n.data.label || n.data.name }));
  }

  return (
    <CustomDialog
      open={isOpen}
      onClose={onClose}
      title={
        <div className="text-sm font-bold text-color-0500 py-0">
          Setting
          <div className="inline-flex text-xs text-slate-400 justify-start items-center mx-4">
            <span className="select-none">{selectedNode?.type} #ID:</span>
            <span className="inline-flex">
              <p className="select-none">[</p>
              <p className="select-all px-2">{selectedNode?.id}</p>
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
      largeScreen={true}
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
