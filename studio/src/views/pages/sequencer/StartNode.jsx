import { useSelector } from "react-redux";
import { Handle, Position } from "reactflow";

const handleStyleSource = {
  backgroundColor: "white",
  width: 8,
  height: 8,
  borderRadius: 90,
  border: "2px solid #01579b"
};

const StartNode = ({ id }) => {
  const { nodes } = useSelector((state) => state.sequencer);
  const node = nodes.find((o) => o.id === id);
  const nodeStatus = node?.status || "READY";

  return (
    <div id={`node-${id}`} className="cursor-pointer flex flex-col items-center justify-center">
      <div className="flex flex-row items-center">
        <svg width="70" height="70" fill="none" viewBox="0 0 110 169">
          <path
            fill={nodeStatus === "COMPLETED" ? "#059669" : "#009ADB"}
            d="M15.888 168.714A15.885 15.885 0 010 152.826V15.893c0-5.68 3.027-10.924 7.944-13.76a15.86 15.86 0 0115.888 0l95.33 68.463a15.885 15.885 0 017.944 13.76c0 5.68-3.026 10.923-7.944 13.759l-95.33 68.47a15.868 15.868 0 01-7.944 2.129"
          />
        </svg>
        <Handle id="start-node" type="source" position={Position.Right} style={handleStyleSource} />
      </div>
      <div className="absolute text-sm text-slate-50 font-medium">Start</div>
    </div>
  );
};

export default StartNode;
