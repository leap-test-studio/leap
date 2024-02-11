import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBezierPath } from "reactflow";

import { IconRenderer } from "../../utilities";
import { sequenceEvents } from "../../../redux/actions/TestSequencerActions";
import { TestStatus } from "./Constants";
const foreignObjectSize = 30;

const DefaultEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, animated, markerEnd }) => {
  const dispatch = useDispatch();
  const {
    settings: { edges, nodes }
  } = useSelector((state) => state.project);
  const edgeInfo = edges?.find((e) => e.id === id);
  let strokeColor = "gray";
  edgeInfo &&
    nodes
      ?.filter((n) => n.id === edgeInfo.source)
      .forEach((n) =>
        n.data?.conditions?.forEach((c) => {
          if (c.fallback === edgeInfo.target) {
            c.statement?.forEach((s) => {
              if (s.operator === "eq") {
                strokeColor = s.rightOp == TestStatus.FAIL ? "red" : s.rightOp == TestStatus.PASS ? "green" : strokeColor;
              }
            });
          }
        })
      );
  const onEdgeClick = useCallback(
    (evt) => {
      evt.stopPropagation();
      dispatch(sequenceEvents("nodeAction:deleteEdge", id));
    },
    [id, dispatch]
  );
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  return (
    <>
      <path id={id} fill="none" stroke={strokeColor} strokeWidth={2.0} className={`${animated && animated}`} d={path} markerEnd={markerEnd} />
      {label && (
        <text className="react-flow__edge-text" x={labelX - 10} y={labelY - 10} dy="0.3em">
          {label}
        </text>
      )}
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button onClick={onEdgeClick}>
          <IconRenderer icon="DeleteForever" className="text-red-500 opacity-0 hover:opacity-100" style={{ fontSize: 16 }} />
        </button>
      </foreignObject>
    </>
  );
};

export default DefaultEdge;
