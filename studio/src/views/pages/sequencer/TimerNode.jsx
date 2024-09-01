import { Handle, Position } from "reactflow";

import NodeHeader from "./NodeHeader";
import NodeFooter from "./NodeFooter";

const handleStyleTarget = {
  backgroundColor: "white",
  width: 6,
  height: 12,
  borderRadius: 90,
  border: "1.5px solid green",
  marginTop: 0
};

const TimerNode = ({ id, type, data, selected }) => {
  const nodeStatus = data?.status || "READY";
  const progress = data?.progress || 0;
  const running = nodeStatus === "ACTIVE" || (progress > 0 && progress < 100);
  const strokeColor = nodeStatus === "ERRORED" ? "#DC2626" : "#059669";
  const timer = data?.timer || 0;

  const handleStyleSource = {
    backgroundColor: "white",
    width: selected ? 12 : 8,
    height: selected ? 12 : 8,
    border: `1.5px solid ${selected ? "" : "#6d48bf"}`,
    marginTop: 0,
    marginLeft: 5
  };

  return (
    <div id={`timer-${id}`} className="relative flex flex-col text-center items-center justify-center px-2">
      <NodeHeader id={id} selected={selected} timer={timer} />
      <Handle id={`target:${id}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <Handle
        id={`source:${id}`}
        type="source"
        position={Position.Right}
        style={handleStyleSource}
        className="h-2 w-2 hover:h-4 hover:w-4 ml-4 bg-color-0050 border border-color-0400 hover:border-green-400"
      />
      <svg width="40" height="40" fill="none" viewBox="0 0 72 84">
        <path
          fill="#6d48bf"
          d="M48 4a4 4 0 00-4-4H28a4 4 0 000 8h16a4 4 0 004-4zM32 48a4 4 0 008 0V32a4 4 0 00-8 0v16zm34.42-19.215c-1.208-1.906-1.075-4.45.52-6.046 1.607-1.606 1.746-4.22.144-5.83-1.59-1.596-4.165-1.428-5.758.165-1.605 1.605-4.173 1.746-6.089.528A35.733 35.733 0 0036 12C16.12 12 0 28.12 0 48s16.08 36 36 36 36-16.12 36-36a35.775 35.775 0 00-5.58-19.215zM36 76C20.52 76 8 63.48 8 48s12.52-28 28-28 28 12.52 28 28-12.52 28-28 28z"
        />
      </svg>
      {running && (
        <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
          <div className="h-1 rounded-full" style={{ background: strokeColor, width: progress + "%" }} />
        </div>
      )}
      <NodeFooter id={id} type={type} label="Timer Event" status="READY" />
    </div>
  );
};

export default TimerNode;
