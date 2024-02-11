import React from "react";
import { Handle, Position } from "reactflow";

import NodeHeader from "./NodeHeader";
import NodeFooter from "./NodeFooter";
import ProgressIcon from "./ProgressIcon";

const handleStyleTarget = {
  backgroundColor: "white",
  width: 8,
  height: 16,
  borderRadius: 90,
  border: "1.5px solid green",
  marginTop: 0
};

const handleStyleSource = {
  backgroundColor: "white",
  width: 10,
  height: 10,
  borderRadius: 90,
  border: "1.5px solid #01579b",
  marginTop: 0
};

const TestCaseNode = ({ id, data, type, selected }) => (
  <div id={"node-" + id} className="flex flex-col text-center items-center justify-center">
    <NodeHeader selected={selected} />
    <div className={`relative ${selected ? "shadow-lg" : "shadow"} bg-slate-100 border-2 border-slate-300 rounded cursor-pointer`}>
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <ProgressIcon icon="ElectricBolt" progress={data?.progress || 0} status={data?.status} size={50} />
      <Handle id={`source:${type}`} type="source" position={Position.Right} style={handleStyleSource} />
    </div>
    <NodeFooter id={id} type={type} label={data?.label} status={data?.enabled ? "ACTIVE" : "INACTIVE"} />
  </div>
);

export default TestCaseNode;
