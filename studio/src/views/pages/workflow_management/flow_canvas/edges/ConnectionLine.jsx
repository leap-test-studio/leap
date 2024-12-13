import { getBezierPath } from "@xyflow/react";

const ConnectionLine = ({ fromX, fromY, fromPosition, toX, toY, toPosition }) => {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition
  });
  return (
    <g>
      <path fill="none" stroke="#6d48bf" strokeWidth={2.0} className="animated" d={edgePath} />
      <circle cx={toX} cy={toY} fill="#fff" r={4.5} stroke="#6d48bf" strokeWidth={1.5} />
    </g>
  );
};

export default ConnectionLine;
