import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";

import TailwindRenderer from "@tailwindrender/.";

import { CustomDialog } from "@utilities/.";
import { getNodeIcon, RequestSchemas, RequestUISchemas } from "./NodeUtils";

function UpdateNodeConfigDialog({ isOpen, onClose, selectedNode, onUpdate }) {
  const { testcases, testsuites } = useSelector((state) => state.project);
  const [isValid, setValid] = useState(false);

  const [nodeData, setNodeData] = useState(
    selectedNode?.data
      ? {
          conditions: [],
          ...selectedNode?.data
        }
      : {}
  );

  const [schemas, setSchemas] = useState({});

  useEffect(() => {
    const schema = RequestSchemas[selectedNode?.type];
    const uischema = RequestUISchemas[selectedNode?.type];
    if (schema.properties?.testSuite) {
      schema.properties.testSuite.oneOf = Object.values(testsuites).map((n) => ({
        const: n.id,
        title: n.name
      }));
    }
    if (schema.properties?.testCase) {
      schema.properties.testCase.oneOf = Object.values(testcases).map((n) => ({
        const: n.id,
        title: n.label + ": " + n.title
      }));
    }
    if (schema.properties?.conditions?.items?.properties?.fallback) {
      if (!isEmpty(testcases))
        schema.properties.conditions.items.properties.fallback.oneOf = Object.values(testcases).map((n) => ({
          const: n.id,
          title: n.label + ": " + n.title
        }));
    }
    setSchemas({
      schema,
      uischema
    });
  }, [selectedNode?.type, testcases, testsuites, nodeData]);

  const handleSave = () =>
    onUpdate({
      ...selectedNode,
      data: nodeData
    });

  return (
    <CustomDialog
      open={isOpen}
      onClose={onClose}
      title={
        <div className="inline-flex items-center space-x-2 text-sm font-bold text-color-0600">
          <div className="size-5">{getNodeIcon(selectedNode?.type, 20)}</div>
          <span>Setting</span>
          <span className="text-xs">{selectedNode?.type}</span>
          <div className="inline-flex text-xs text-slate-400">
            #ID:
            <p className="select-none">[</p>
            <p className="select-all px-1">{selectedNode?.id}</p>
            <p className="select-none">]</p>
          </div>
        </div>
      }
      saveTitle="Save"
      buttonDisabled={!isValid}
      onSave={handleSave}
      customWidth="w-[30vw]"
      customHeight="min-h-[20vh] h-[20vh]"
    >
      {!isEmpty(schemas) && (
        <TailwindRenderer
          {...schemas}
          data={nodeData}
          isValid={setValid}
          onChange={({ data }) => {
            if (!isEqual(nodeData, data)) {
              setNodeData(data);
            }
          }}
        />
      )}
    </CustomDialog>
  );
}

export default UpdateNodeConfigDialog;
