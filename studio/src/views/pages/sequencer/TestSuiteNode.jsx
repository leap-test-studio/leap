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

const TestSuiteNode = ({ id, type, data }) => {
  return (
    <div
      id={"node-" + id}
      className="group shadow-xl hover:shadow-2xl rounded cursor-pointer border border-slate-300 bg-red-300 opacity-50 w-full h-full"
    >
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <p className="text-center z-auto p-1.5 w-full">{data?.label}</p>
      <Handle id={`source:${type}`} type="source" position={Position.Right} style={handleStyleSource} />
    </div>
  );
};

export default TestSuiteNode;
