import React from "react";
import { Handle, Position } from "reactflow";

import NodeHeader from "./NodeHeader";
import NodeFooter from "./NodeFooter";
import { useSelector } from "react-redux";

const handleStyleTarget = {
  backgroundColor: "white",
  width: 6,
  height: 12,
  borderRadius: 90,
  border: "1.5px solid green",
  marginTop: 0
};

const handleStyleSource = {
  backgroundColor: "white",
  width: 8,
  height: 8,
  borderRadius: 90,
  border: "1.5px solid #6d48bf",
  marginTop: 0
};

const TestCaseNode = ({ id, data, type, selected }) => {
  const { testcases } = useSelector((state) => state.project);
  const nodeData = testcases[data.id];
  if (!nodeData) return null;
  return (
    <div id={"tc-node-" + id} className="flex flex-col text-center items-center justify-center cursor-pointer">
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <Handle id={`source:${type}`} type="source" position={Position.Right} style={handleStyleSource} />
      <NodeHeader id={id} selected={selected} />
      <img
        src={`/assets/img/${nodeData.type === 2 ? "chrome-logo.svg" : "rest-api-icon.svg"}`}
        alt={nodeData.label}
        width={50}
        height={50}
        style={{ margin: "10px" }}
      />
      <NodeFooter
        id={id}
        type={type}
        label={nodeData?.label}
        status={nodeData?.enabled ? "ACTIVE" : "INACTIVE"}
        tags={nodeData.tags}
        tooltip={nodeData.title}
      />
    </div>
  );
};

export default TestCaseNode;
