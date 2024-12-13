import React, { useCallback, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  MarkerType,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import { customAlphabet } from "nanoid/non-secure";
import dagre from "@dagrejs/dagre";
import { useDebouncedCallback } from "use-debounce";
import Swal from "sweetalert2";

import { E_DIRECTION, E_EVENT_TYPE, E_EXEC_STATE, E_STATIC_ID } from "engine_utils";
import { CloseButton, IconButton, Tooltip } from "@utilities/.";
import { fetchProject, triggerSequence, fetchWorkflow, sequenceEvents, updateSequence, resetTestCaseFlags } from "@redux-actions/.";

import { RequestSchemas, nodeTypes, edgeTypes, draggableItems } from "./NodeUtils";
import ConnectionLine from "./edges/ConnectionLine";
import UpdateNodeConfigDialog from "./UpdateNodeConfigDialog";
import DragabbleElements from "../../common/DragabbleElements";
import { PageHeader, Page, PageActions, PageTitle } from "../../common/PageLayoutComponents";
import ProgressIndicator from "../../common/ProgressIndicator";
import { DEFAULT_HEADER_HEIGHT } from "../../../../Constants";

const nanoid = customAlphabet("1234567890ABCDEF", 10);
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const FlowRenderer = ({ workflow, windowDimension, pageTitle, onClose, project }) => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [direction, setDirection] = useState(E_DIRECTION.HORIZONTAL);

  const { projectData } = useSelector((state) => state.project);
  const { simulationData, savingChanges, wf: selectedWorkflow } = useSelector((state) => state.workflow);
  const [nodes, setNodes, onNodesChange] = useNodesState(selectedWorkflow.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(selectedWorkflow.edges || []);

  const actionType = simulationData?.type;
  const eid = simulationData?.opts;

  const { details, message, showMessage } = useSelector((state) => state.testcase);

  useEffect(() => {
    if (showMessage) {
      Swal.fire({
        title: message,
        icon: showMessage,
        text: details,
        width: 550,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed || response.isDismissed) {
          dispatch(resetTestCaseFlags());
        }
      });
    }
  }, [showMessage]);

  const loadWorkflow = useCallback(
    (id) => {
      project?.id && dispatch(fetchProject(project?.id));
      id && dispatch(fetchWorkflow(id));
    },
    [project?.id]
  );

  const handleDialogClose = useCallback(() => {
    setShowConfigDialog(false);
    dispatch(sequenceEvents("nodeAction:reset"));
  }, [dispatch]);

  const saveChanges = useCallback(
    (ns = [], es = []) => {
      dispatch(
        updateSequence(workflow?.id, {
          ProjectMasterId: project?.id,
          nodes: isEmpty(ns) ? [] : ns,
          edges: isEmpty(es) ? [] : es
        })
      );
    },
    [workflow]
  );

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), [setSelectedNode]);

  const onNodeDoubleClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
      setShowConfigDialog(RequestSchemas[node.type] !== undefined);
    },
    [setSelectedNode, setShowConfigDialog]
  );

  const onDragOver = useCallback((ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (ev) => {
      ev.preventDefault();
      if (reactFlowInstance) {
        let data = {};
        const type = ev.dataTransfer.getData("node-type");
        try {
          data = JSON.parse(ev.dataTransfer.getData("node-value"));
        } catch (error) {
          error;
        }

        let clientX = isNaN(ev?.clientX) ? 300 : +ev?.clientX;
        let clientY = isNaN(ev?.clientX) ? 300 : +ev?.clientY;
        if (clientX < 0) clientX = 300;
        if (clientY < 0) clientY = 300;
        const isHorizontal = direction === E_DIRECTION.HORIZONTAL;
        const changes = [
          ...nodes,
          {
            id: nanoid(10),
            type,
            data,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: reactFlowInstance.screenToFlowPosition({
              x: clientX - 30,
              y: clientY - 30
            })
          }
        ];
        setNodes(changes);
      }
    },
    [edges, nodes, reactFlowInstance, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_ev, node) => {
      const i = nodes.findIndex((item) => item.id === node.id);
      const currentNode = nodes[i];
      if (currentNode && currentNode.position?.x != node?.position?.x && currentNode.position?.y != node?.position?.y) {
        nodes[i].position = node?.position;
        setNodes(nodes);
      }
    },
    [edges, nodes, setNodes]
  );

  const onConnect = useCallback(
    (params) => {
      const changes = addEdge(
        {
          ...params,
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "rgb(148 163 184)"
          },
          type: "default"
        },
        edges
      );
      setEdges(changes);
    },
    [edges, nodes, setEdges, addEdge]
  );

  const fitView = useCallback(
    (sleep = 2000) => {
      if (reactFlowInstance)
        setTimeout(() => {
          reactFlowInstance.fitView({
            maxZoom: 1.5,
            minZoom: 0.5,
            duration: 200
          });
        }, sleep);
    },
    [reactFlowInstance]
  );

  const saveDebounced = useDebouncedCallback((ns, es) => {
    saveChanges(ns, es);
  }, 3000);

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = nanoid();
        const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0] : event;
        const isHorizontal = direction === E_DIRECTION.HORIZONTAL;
        const newNode = {
          id,
          position: reactFlowInstance.screenToFlowPosition({
            x: clientX,
            y: clientY
          }),
          type: E_EVENT_TYPE.TEST_CASE_EVENT,
          data: { label: "testCase" },
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          origin: [0.5, 0.0]
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({ id, source: connectionState.fromNode.id, target: id }));
      }
    },
    [reactFlowInstance, nodes, direction]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );

  const onUpdate = useCallback(
    (node) => {
      if (selectedNode) {
        const index = nodes.findIndex((p) => p.id === selectedNode.id);
        if (index > -1) {
          const changes = cloneDeep(nodes);
          changes[index] = {
            ...changes[index],
            ...node
          };
          setNodes(changes);
        }
      }
      handleDialogClose();
    },
    [edges, nodes, selectedNode, setNodes]
  );

  const deleteNode = useCallback(() => {
    handleDialogClose();
    const changes = [...nodes];
    if (selectedNode) {
      const index = nodes.findIndex((node) => node.id === selectedNode.id);
      if (index > -1) {
        const node = nodes[index];
        const incomers = getIncomers(node, nodes, edges);
        const outgoers = getOutgoers(node, nodes, edges);
        const connectedEdges = getConnectedEdges([node], edges);
        const remainingEdges = edges.filter((edge) => !connectedEdges.includes(edge));
        const createdEdges = incomers.flatMap(({ id: source }) =>
          outgoers.map(({ id: target }) => ({
            id: `${source}->${target}`,
            source,
            target,
            animated: true
          }))
        );
        changes.splice(index, 1);

        const e = [...remainingEdges, ...createdEdges];
        setNodes(changes);
        setEdges(e);
      }
    }
  }, [edges, nodes, selectedNode]);

  const deleteEdge = useCallback(() => {
    if (eid) {
      const edgeChanges = [...edges];
      const nodeChanges = [];
      const deletingEdge = edges.find((e) => e.id === eid);
      const index = edges.findIndex((e) => e.id === eid);
      edgeChanges.splice(index, 1);
      nodes.forEach((n) => {
        nodeChanges.push({
          ...n,
          data: {
            ...n.data,
            conditions: n.data.conditions?.filter((c) => c.fallback !== deletingEdge.target)
          }
        });
      });
      setEdges(edgeChanges);
      setNodes(nodeChanges);
    }
    handleDialogClose();
  }, [edges, eid, nodes]);

  const isValidConnection = useCallback(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [nodes, edges]
  );

  const resetCanvas = (consent = true) => {
    const reset = () => {
      const isHorizontal = direction === E_DIRECTION.HORIZONTAL;
      const ns = [
        {
          id: E_STATIC_ID.START,
          type: E_EVENT_TYPE.START_EVENT,
          data: projectData?.settings || {},
          position: { x: 50, y: 300 },
          targetPosition: isHorizontal ? "left" : "top",
          sourcePosition: isHorizontal ? "right" : "bottom"
        },
        {
          id: E_STATIC_ID.STOP,
          type: E_EVENT_TYPE.STOP_EVENT,
          data: {},
          position: { x: 50, y: 600 },
          targetPosition: isHorizontal ? "left" : "top",
          sourcePosition: isHorizontal ? "right" : "bottom"
        }
      ];
      setEdges([]);
      setNodes(ns);
      fitView(3000);
    };
    if (!consent) {
      reset();
    } else
      Swal.fire({
        title: "Are you sure you want to Reset canvas?",
        text: `Workflow: ${workflow?.name}`,
        icon: "question",
        confirmButtonText: "YES",
        confirmButtonColor: "red",
        showCancelButton: true,
        cancelButtonText: "NO",
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((response) => {
        if (response.isConfirmed) {
          reset();
        }
      });
  };

  const getLayoutedElements = (nodes = [], edges = [], direction = E_DIRECTION.VERTICAL) => {
    const nodeWidth = 300;
    const nodeHeight = 150;
    const isHorizontal = direction === E_DIRECTION.HORIZONTAL;
    dagreGraph.setGraph({ rankdir: isHorizontal ? "LR" : "TB" });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const newNode = {
        ...node,
        targetPosition: isHorizontal ? "left" : "top",
        sourcePosition: isHorizontal ? "right" : "bottom",
        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2
        }
      };

      return newNode;
    });

    return { nodes: newNodes, edges };
  };

  const onLayout = useCallback(
    (direction) => {
      setDirection(direction);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      fitView();
    },
    [nodes, edges]
  );

  useEffect(() => {
    loadWorkflow(workflow?.id);
  }, [workflow?.id]);

  useEffect(() => {
    if (selectedWorkflow?.nodes?.length == 0 && selectedWorkflow?.edges?.length == 0) {
      return resetCanvas(false);
    }
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(selectedWorkflow?.nodes, selectedWorkflow?.edges, direction);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [selectedWorkflow?.nodes, selectedWorkflow?.edges]);

  useEffect(() => {
    saveDebounced(nodes, edges);
  }, [nodes, edges, saveDebounced]);

  useEffect(() => {
    switch (actionType) {
      case "nodeAction:editNode":
        setShowConfigDialog(true);
        break;
      case "nodeAction:deleteNode":
        deleteNode();
        break;
      case "nodeAction:deleteEdge":
        deleteEdge();
        break;
      case "nodeAction:reset":
        setShowConfigDialog(false);
        dispatch(sequenceEvents("nodeAction:clear"));
        break;
      default:
    }
  }, [actionType]);

  useEffect(() => {
    fitView();
  }, [reactFlowInstance, fitView]);

  const minHeight = windowDimension?.maxContentHeight - DEFAULT_HEADER_HEIGHT;

  return (
    <Page>
      <PageHeader>
        <PageTitle>{pageTitle}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Auto saving" show={savingChanges} />
          <IconButton title="Reset" icon="ClearAll" onClick={resetCanvas} tooltip="Clear the Canvas" />
          {selectedWorkflow.status !== E_EXEC_STATE.RUNNING ? (
            <IconButton title="Run" icon="PlayArrow" onClick={() => dispatch(triggerSequence(workflow?.id))} tooltip="Run workflow" />
          ) : (
            <IconButton
              title="Stop"
              icon="Stop"
              onClick={() => dispatch(triggerSequence(workflow?.id))}
              tooltip="Stop workflow"
              bg="bg-red-600 hover:bg-red-500"
            />
          )}
          <CloseButton onClose={onClose} />
        </PageActions>
      </PageHeader>
      <div
        className="flex flex-row"
        style={{
          minHeight,
          maxHeight: minHeight
        }}
      >
        <div
          className="h-full w-full reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{
            minHeight,
            maxHeight: minHeight
          }}
        >
          <ReactFlowProvider>
            <ReactFlow
              id="flow-canvas"
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              maxZoom={1.5}
              minZoom={0.5}
              deleteKeyCode={46}
              elementsSelectable={true}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              connectionLineComponent={ConnectionLine}
              onNodesChange={onNodesChange}
              onNodesDelete={onNodesDelete}
              onEdgesChange={onEdgesChange}
              onNodeDragStop={onNodeDragStop}
              onConnect={onConnect}
              onConnectEnd={onConnectEnd}
              isValidConnection={isValidConnection}
              onInit={setReactFlowInstance}
              style={{ background: "#f8f8f8" }}
              proOptions={{
                account: "paid-custom",
                hideAttribution: true
              }}
              className="border rounded-md shadow"
            >
              <div className="react-flow__panel top right bg-white shadow rounded-lg border transition duration-300">
                <DragabbleElements elements={draggableItems} showExpand={false} showFilter={false} title="Blocks" />
              </div>
              <div className="react-flow__panel bottom left flex flex-row space-x-2">
                <div className="border shadow bg-white p-1 rounded-xl flex flex-row items-center space-x-1 text-slate-500">
                  <Tooltip title="Horizontal" placement="bottom">
                    <button
                      className={`${direction === E_DIRECTION.HORIZONTAL ? "bg-slate-100" : ""} hover:bg-slate-100 cursor-pointer p-2 rounded-lg`}
                      onClick={() => onLayout(E_DIRECTION.HORIZONTAL)}
                    >
                      <svg viewBox="0 0 16 16" height={15} width={15}>
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4 2.5H2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5ZM2 1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2Zm12 1.5h-2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5ZM12 1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-2Zm2 9.5h-2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5ZM12 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2ZM7.25 4.75H6v-1.5h4v1.5H8.75V10c0 .69.56 1.25 1.25 1.25v1.5A2.75 2.75 0 0 1 7.25 10V4.75Z"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip title="Vertical" placement="bottom">
                    <button
                      className={`${direction === E_DIRECTION.VERTICAL ? "bg-slate-100" : ""} hover:bg-slate-100 cursor-pointer p-2 rounded-lg`}
                      onClick={() => onLayout(E_DIRECTION.VERTICAL)}
                    >
                      <svg viewBox="0 0 16 16" height={15} width={15}>
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.5 2.5h-4v1h4v-1ZM1.5 1A1.5 1.5 0 0 0 0 2.5v1A1.5 1.5 0 0 0 1.5 5h4A1.5 1.5 0 0 0 7 3.5v-1A1.5 1.5 0 0 0 5.5 1h-4Zm4 6.5h-4v1h4v-1ZM1.5 6A1.5 1.5 0 0 0 0 7.5v1A1.5 1.5 0 0 0 1.5 10h4A1.5 1.5 0 0 0 7 8.5v-1A1.5 1.5 0 0 0 5.5 6h-4Zm4 6.5h-4v1h4v-1Zm-4-1.5A1.5 1.5 0 0 0 0 12.5v1A1.5 1.5 0 0 0 1.5 15h4A1.5 1.5 0 0 0 7 13.5v-1A1.5 1.5 0 0 0 5.5 11h-4Zm13-3.5h-4v1h4v-1Zm-4-1.5A1.5 1.5 0 0 0 9 7.5v1a1.5 1.5 0 0 0 1.5 1.5h4A1.5 1.5 0 0 0 16 8.5v-1A1.5 1.5 0 0 0 14.5 6h-4Zm4 6.5h-4v1h4v-1Zm-4-1.5A1.5 1.5 0 0 0 9 12.5v1a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-1a1.5 1.5 0 0 0-1.5-1.5h-4Z"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>
              <Controls position="bottom-right" />
              {showConfigDialog && selectedNode !== null && (
                <UpdateNodeConfigDialog
                  showDialog={showConfigDialog}
                  selectedNode={selectedNode}
                  onUpdate={onUpdate}
                  onClose={handleDialogClose}
                  isOpen={true}
                />
              )}
              <Background color="#aaa" gap={15} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </Page>
  );
};

export default FlowRenderer;
