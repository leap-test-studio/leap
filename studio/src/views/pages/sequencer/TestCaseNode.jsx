import React from "react";
import { Handle, Position } from "reactflow";

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
  border: "1.5px solid #01579b",
  marginTop: 0
};

const TestCaseNode = ({ id, type, data }) => {
  return (
    <div id={"node-" + id} className="group rounded cursor-pointer border border-slate-400 select-none bg-white p-1.5">
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <p className="text-center">{data?.label}</p>
      <Handle id={`source:${type}`} type="source" position={Position.Right} style={handleStyleSource} />
    </div>
  );
};

export default TestCaseNode;
