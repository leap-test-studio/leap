import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBezierPath } from "@xyflow/react";
import Swal from "sweetalert2";
import { E_EXEC_STATE } from "engine_utils";

import { IconRenderer } from "@utilities/.";
import { sequenceEvents } from "@redux-actions/.";

const foreignObjectSize = 30;

const DefaultEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, animated, markerEnd, deletable }) => {
  const dispatch = useDispatch();
  const { edges, nodes } = useSelector((state) => state.workflow.wf);
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
                strokeColor = s.rightOp == E_EXEC_STATE.FAIL ? "red" : s.rightOp == E_EXEC_STATE.PASS ? "green" : strokeColor;
              }
            });
          }
        })
      );
  const onEdgeClick = useCallback(
    (evt) => {
      evt.stopPropagation();
      Swal.fire({
        title: "Are you sure you want to Delete Edge?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "YES",
        cancelButtonText: "NO",
        confirmButtonColor: "red",
        cancelButtonColor: "green",
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed) {
          dispatch(sequenceEvents("nodeAction:deleteEdge", id));
        }
      });
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
      <path id={id} fill="none" stroke={strokeColor} strokeWidth={1} className={`${animated && animated}`} d={path} markerEnd={markerEnd} />
      {label && (
        <text className="react-flow__edge-text" x={labelX - 10} y={labelY - 10} dy="0.3em">
          {label}
        </text>
      )}
      {deletable && (
        <foreignObject width={foreignObjectSize} height={foreignObjectSize} x={labelX - foreignObjectSize / 2} y={labelY - foreignObjectSize / 2}>
          <button onClick={onEdgeClick} className="group size-7 rounded-full hover:bg-white flex flex-row items-center justify-center text-center">
            <IconRenderer icon="Cancel" className="text-red-600 opacity-0 group-hover:opacity-100" style={{ fontSize: 18 }} />
          </button>
        </foreignObject>
      )}
    </>
  );
};

export default DefaultEdge;
