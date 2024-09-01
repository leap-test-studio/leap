import React from "react";
import { useSelector } from "react-redux";
import { Handle, Position } from "reactflow";

import NodeHeader from "./NodeHeader";
import NodeFooter from "./NodeFooter";
import ProgressIcon from "./ProgressIcon";

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

const TestScenarioNode = ({ id, data, type, selected }) => {
  const { testsuites } = useSelector((state) => state.project);
  const nodeData = testsuites[data.id];
  if (!nodeData) return null;
  return (
    <div id={"node-" + id} className="relative flex flex-col text-center items-center justify-center mx-2">
      <NodeHeader id={id} selected={selected} />
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <ProgressIcon icon="NextWeekRounded" progress={nodeData.progress || 0} status={nodeData.status} size={50} />
      <Handle id={`source:${type}`} type="source" position={Position.Right} style={handleStyleSource} />
      <NodeFooter id={id} type={type} label={nodeData.name} status={nodeData.status ? "ACTIVE" : "INACTIVE"} tags={nodeData.remark} />
    </div>
  );
};

export default TestScenarioNode;
