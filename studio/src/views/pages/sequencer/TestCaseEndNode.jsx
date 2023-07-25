import { Handle, Position } from "reactflow";
import IconRenderer from "../../MuiIcons";

const handleStyleTarget = {
  backgroundColor: "white",
  width: 6,
  height: 12,
  borderRadius: 90,
  border: "1.5px solid green",
  marginTop: 0
};

const TestCaseEndNode = ({ id, type }) => {
  return (
    <div id={id} className="cursor-pointer flex flex-row items-center justify-center">
      <Handle id={`target:${type}`} type="target" position={Position.Left} style={handleStyleTarget} />
      <IconRenderer icon="StopCircle" className="cursor-pointer text-red-500" style={{ fontSize: 30 }} />
    </div>
  );
};

export default TestCaseEndNode;
