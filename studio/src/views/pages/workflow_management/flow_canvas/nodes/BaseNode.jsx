import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Handle, useReactFlow } from "@xyflow/react";
import { FaClone, FaMinus, FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { IoPlay } from "react-icons/io5";
import Swal from "sweetalert2";
import { E_NODE_STATE, E_EVENT_TYPE, E_EXEC_STATE } from "engine_utils";
import merge from "lodash/merge";

import TailwindRenderer from "@tailwindrender/.";
import { Tooltip } from "@utilities/.";
import { convertMsToHMString } from "@tailwindrender/util/converter";
import { runTestCase, sequenceEvents } from "@redux-actions/.";
import WebContext from "@WebContext";

import RenderStatusIcon from "./RenderStatusIcon";
import { getNodeIcon, RequestSchemas, RequestUISchemas } from "../NodeUtils";

const handleStyleTarget = {
  backgroundColor: "white",
  width: 6,
  height: 12,
  borderRadius: 90,
  border: "1.5px solid green"
};

const BaseNode = ({ id, type, data, customLabel, selected, sourcePosition, targetPosition, showSource = true, showTarget = true }) => {
  const dispatch = useDispatch();
  const [isCollapsed, setCollapse] = useState(true);
  const [node, setNode] = useState();
  const { wf } = useSelector((state) => state.workflow);
  const { project } = useContext(WebContext);

  const { updateNodeData } = useReactFlow();

  const getSourceHandleStyle = useCallback(
    () => ({
      backgroundColor: "white",
      width: 8,
      height: 8,
      border: `1.5px solid ${selected ? "" : "#6d48bf"}`
    }),
    [selected]
  );

  useEffect(() => {
    setNode(wf?.nodes.find((o) => o.id === id));
  }, [wf?.nodes]);

  const nodeStatus = node?.status;
  const progress = node?.progress || 0;
  const showStatus = wf?.status !== E_EXEC_STATE.DRAFT && nodeStatus != E_NODE_STATE.READY && node?.progress > 0;
  const strokeColor = nodeStatus === E_NODE_STATE.ERRORED || nodeStatus === E_NODE_STATE.ABORTED ? "#DC2626" : "#059669";
  const timer = (data?.timer || 0) * 1000;
  const label = data?.label || type;
  const isTestCase = E_EVENT_TYPE.TEST_CASE_EVENT === type;
  const isTestSuite = E_EVENT_TYPE.TEST_SUITE_EVENT === type;
  const iconTooltip = E_EVENT_TYPE.TIMER_EVENT === type ? `Timer is ${nodeStatus}` : `Test ${isTestSuite ? "Suite" : "Case"} is ${nodeStatus}`;

  const triggerTestCase = useCallback(() => {
    dispatch(runTestCase(project?.id, data?.testCase));
  }, [project?.id, data?.testCase, dispatch, runTestCase]);

  return (
    <div className="flex justify-center items-center">
      {showTarget && <Handle id={`target:${id}`} type="target" position={targetPosition} style={handleStyleTarget} />}
      {showSource && (
        <Handle
          id={`source:${id}`}
          type="source"
          position={sourcePosition}
          style={getSourceHandleStyle()}
          className="bg-color-0050 border border-color-0400 hover:border-green-400"
        />
      )}
      <div
        id={`node-${id}`}
        className={`group relative flex flex-col items-center m-3 justify-center h-fit ${[E_EVENT_TYPE.START_EVENT, E_EVENT_TYPE.STOP_EVENT].includes(type) ? "w-52" : "w-64"} bg-white border ${selected ? "shadow-lg shadow-blue-100 border-blue-400" : "shadow-sm border-slate-400/50  hover:border-blue-300"} p-2 rounded-md`}
      >
        <div className="absolute -top-4 inline-flex w-full justify-between items-center px-2">
          <label className="text-[10px]">#{id}</label>
          {timer > 0 && (
            <span
              className="font-medium leading-none rounded-full"
              style={{
                fontSize: 9
              }}
            >
              Wait for {convertMsToHMString(timer)}
            </span>
          )}
        </div>
        <div className="flex flex-row w-full justify-between text-color-0600">
          <div className="inline-flex space-x-1 items-start">
            <Tooltip title={type.replaceAll("_", " ")} placement="top">
              <div className="text-sm text-color-0600 hover:text-color-0500 transition duration-150 hover:bg-slate-100 p-1 rounded-md">
                {getNodeIcon(type, 16)}
              </div>
            </Tooltip>
            <div className="text-xs text-color-label break-all font-medium pt-1">{label}</div>
          </div>

          <div className="inline-flex items-start justify-end space-x-1">
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="top">
              <button
                onClick={() => setCollapse(!isCollapsed)}
                className={`inline-flex items-center justify-center text-sm text-color-0600 hover:text-color-0500 transition duration-150 hover:bg-slate-100 p-1 rounded-md`}
              >
                {isCollapsed ? <FaPlus size={16} /> : <FaMinus size={16} />}
              </button>
            </Tooltip>
            {[E_EVENT_TYPE.TEST_CASE_EVENT, E_EVENT_TYPE.TEST_SUITE_EVENT].includes(type) && (
              <Tooltip title={`Run Test ${isTestSuite ? "Suite" : "Case"}`} placement="top">
                <button
                  onClick={() => {
                    if (isTestCase) {
                      triggerTestCase();
                    }
                  }}
                  className={`inline-flex items-center justify-center text-sm text-color-0600 hover:text-green-500 transition duration-150 hover:bg-slate-100 p-1 rounded-md`}
                >
                  <IoPlay size={16} />
                </button>
              </Tooltip>
            )}
            {![E_EVENT_TYPE.START_EVENT, E_EVENT_TYPE.STOP_EVENT].includes(type) && (
              <Menu>
                <MenuButton className="size-5">
                  {() => (
                    <div
                      id={`menu-${id}`}
                      className={`text-sm text-color-0600 hover:text-color-0500 transition duration-150 hover:bg-slate-100 p-1 rounded-md`}
                    >
                      <BsThreeDots size={16} />
                    </div>
                  )}
                </MenuButton>
                <MenuItems
                  anchor="bottom"
                  transition
                  className="min-w-40 transition duration-200 ease-out bg-white border border-slate-300 py-1.5 rounded shadow-lg overflow-hidden"
                >
                  <MenuItem
                    as="div"
                    className="text-xs hover:bg-color-0100 font-medium text-color-0600 hover:text-color-0500 flex flex-row items-center space-x-2 p-1.5 px-2 cursor-pointer mx-1.5 rounded"
                    onClick={() => dispatch(sequenceEvents("nodeAction:cloneNode"))}
                  >
                    <FaClone />
                    <span>Clone</span>
                  </MenuItem>
                  <MenuItem
                    as="div"
                    className="text-xs hover:bg-color-0100 font-medium text-color-0600 hover:text-color-0500 flex flex-row space-x-2 items-center p-1.5 px-2 cursor-pointer mx-1.5 rounded"
                    onClick={() => {
                      Swal.fire({
                        title: "Are you sure you want to Delete Node?",
                        text: `Node Id: ${id}`,
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
                          dispatch(sequenceEvents("nodeAction:deleteNode"));
                        }
                      });
                    }}
                  >
                    <MdDelete />
                    <span>Delete</span>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
        {customLabel && <div className="flex flex-col w-full px-1 mt-1">{customLabel}</div>}
        {!isCollapsed && (
          <div className="flex flex-col w-full items-center justify-between text-color-label border-t pt-2">
            <TailwindRenderer
              schema={RequestSchemas.labelSchema}
              uischema={RequestUISchemas.labelUiSchema}
              data={node}
              onChange={({ data }) => {
                updateNodeData(id, merge(node, data));
              }}
            />
          </div>
        )}
        {showStatus && (
          <div className="inline-flex w-full items-center space-x-2 px-2">
            {nodeStatus !== E_NODE_STATE.READY && (
              <RenderStatusIcon status={nodeStatus} progress={progress} tooltip={label} description={iconTooltip} />
            )}
            <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
              <div className="h-1 rounded-full" style={{ background: strokeColor, width: progress + "%" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseNode;
