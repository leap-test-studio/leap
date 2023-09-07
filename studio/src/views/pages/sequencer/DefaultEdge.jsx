import { getBezierPath } from "reactflow";
import IconRenderer from "../../MuiIcons";
import { sequenceEvents } from "../../../redux/actions/TestSequencerActions";
import { useDispatch } from "react-redux";
import { useCallback } from "react";

const foreignObjectSize = 30;

const DefaultEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, animated, markerEnd }) => {
  const dispatch = useDispatch();
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
      <path id={id} fill="none" stroke="rgb(148 163 184)" strokeWidth={2.0} className={`${animated && animated}`} d={path} markerEnd={markerEnd} />
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
