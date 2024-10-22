import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactFlow, {
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  MarkerType,
  getIncomers,
  getOutgoers,
  getConnectedEdges
} from "reactflow";
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import isEmpty from "lodash/isEmpty";
import { nanoid } from "nanoid";

import ConnectionLine from "./ConnectionLine";
import TestCaseNode from "./TestCaseNode";
import StartNode from "./StartNode";
import DefaultEdge from "./DefaultEdge";
import TimerNode from "./TimerNode";
import { NodeTypes } from "./Constants";
import UpdateNodeConfigDialog from "./UpdateNodeConfigDialog";
import DragabbleElements from "../common/DragabbleElements";
import { PageHeader, Page, PageActions, PageTitle } from "../common/PageLayoutComponents";
import { sequenceEvents, updateSequence } from "../../../redux/actions/TestSequencerActions";
import { fetchProject, triggerSequence } from "../../../redux/actions/ProjectActions";
import TestScenarioNode from "./TestScenarioNode";
import { CloseButton, IconButton, Tooltip } from "../../utilities";
import { RequestSchemas } from "./NodeUtils";
import { fetchTestPlan } from "../../../redux/actions/TestPlanActions";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import ProgressIndicator from "../common/ProgressIndicator";
import { DEFAULT_HEADER_HEIGHT } from "../../../Constants";

const nodeTypes = Object.freeze({
  [NodeTypes.START_TASK]: StartNode,
  [NodeTypes.CASE_TASK]: TestCaseNode,
  [NodeTypes.SCENARIO_TASK]: TestScenarioNode,
  [NodeTypes.TIMER_TASK]: TimerNode
});

const edgeTypes = Object.freeze({ default: DefaultEdge });

const TestCaseSequencer = ({ testPlan, windowDimension, pageTitle, onClose, project }) => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutoSave, setAutoSave] = useState(true);

  const { testcases, draggableItems } = useSelector((state) => state.project);
  const { plan: settings } = useSelector((state) => state.testplan);
  const { simulationData, savingChanges } = useSelector((state) => state.sequencer);
  const [nodes, setNodes, onNodesChange] = useNodesState(settings.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(settings.edges || []);

  const actionType = simulationData?.type;
  const eid = simulationData?.opts;

  useEffect(() => {
    loadPlanner(testPlan?.id);
  }, [testPlan?.id]);

  useEffect(() => {
    if (settings?.nodes?.length == 0 && settings?.edges?.length == 0) {
      return resetCanvas();
    }
    if (settings?.nodes?.length >= 0) {
      setNodes(settings.nodes);
    }
    if (settings?.edges?.length >= 0) {
      setEdges(settings.edges);
    }
  }, [testcases, draggableItems, settings]);

  const loadPlanner = (id) => {
    id && dispatch(fetchTestPlan(id));
    project?.id && dispatch(fetchProject(project?.id));
  };

  const handleDialogClose = useCallback(() => {
    setShowConfigDialog(false);
    dispatch(sequenceEvents("nodeAction:reset"));
  }, [dispatch]);

  const saveChanges = useCallback(
    (ns = [], es = []) => {
      dispatch(
        updateSequence(testPlan?.id, {
          ProjectMasterId: project?.id,
          nodes: isEmpty(ns) ? [] : ns,
          edges: isEmpty(es) ? [] : es
        })
      );
    },
    [testPlan]
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
        const type = ev.dataTransfer.getData("node-type");
        try {
          var data = JSON.parse(ev.dataTransfer.getData("node-value"));
        } catch (error) {
          error;
        }

        let clientX = isNaN(ev?.clientX) ? 300 : +ev?.clientX;
        let clientY = isNaN(ev?.clientX) ? 300 : +ev?.clientY;
        if (clientX < 0) clientX = 300;
        if (clientY < 0) clientY = 300;

        const changes = [
          ...nodes,
          {
            id: nanoid(10),
            type,
            data,
            position: reactFlowInstance.screenToFlowPosition({
              x: clientX - 30,
              y: clientY - 30
            })
          }
        ];
        setNodes(changes);
        isAutoSave && saveChanges(changes, edges);
      }
    },
    [edges, nodes, reactFlowInstance, saveChanges, setNodes]
  );

  const onDragStop = useCallback(
    (_ev, node) => {
      if (node) {
        const i = nodes.findIndex((item) => item.id === node.id);
        if (i > -1) {
          nodes[i] = node;
          setNodes(nodes);
          isAutoSave && saveChanges(nodes, edges);
        }
      }
    },
    [edges, nodes, saveChanges, setNodes]
  );

  const onConnect = useCallback(
    (params) => {
      const changes = addEdge(
        {
          ...params,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "rgb(148 163 184)"
          },
          type: "default"
        },
        edges
      );
      setEdges(changes);
      isAutoSave && saveChanges(nodes, changes);
    },
    [edges, nodes, setEdges]
  );

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

  const minHeight = windowDimension?.maxContentHeight - DEFAULT_HEADER_HEIGHT;

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
          nodes[index] = {
            ...nodes[index],
            ...node
          };
          setNodes(nodes);
          isAutoSave && saveChanges(nodes, edges);
        }
      }
      handleDialogClose();
    },
    [edges, handleDialogClose, nodes, saveChanges, selectedNode, setNodes]
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
        isAutoSave && saveChanges(changes, e);
      }
    }
  }, [edges, handleDialogClose, nodes, saveChanges, selectedNode, setNodes]);

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
      isAutoSave && saveChanges(nodeChanges, edgeChanges);
    }
    handleDialogClose();
  }, [edges, eid, handleDialogClose, nodes, saveChanges, setEdges, setNodes]);

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

  const resetCanvas = () => {
    const ns = [
      {
        id: "start",
        type: NodeTypes.START_TASK,
        data: { label: "Start" },
        position: { x: 50, y: 300 }
      }
    ];
    setEdges([]);
    setNodes(ns);
    saveChanges(ns, []);
  };

  return (
    <Page>
      <PageHeader>
        <PageTitle>{pageTitle}</PageTitle>
        <PageActions>
          <ProgressIndicator title="Saving" show={isAutoSave && savingChanges} />
          <Tooltip title="Enable Auto Save changes">
            <div className="inline-flex items-center">
              <label>Auto-Save</label>
              <TailwindToggleRenderer path="auto-save" visible={true} enabled={true} data={isAutoSave} handleChange={(_, ev) => setAutoSave(ev)} />
            </div>
          </Tooltip>
          <IconButton title="Reset" icon="ClearAll" onClick={resetCanvas} tooltip="Clear the Canvas" />
          <IconButton
            title="Trigger"
            icon="PlayArrow"
            onClick={() => dispatch(triggerSequence(testPlan?.id))}
            tooltip="Trigger the execution of Test Plan"
          />

          <CloseButton onClose={onClose} />
        </PageActions>
      </PageHeader>
      <div
        className="flex flex-row my-1 rounded border"
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
          <ReactFlow
            id="testsequencer-canvas"
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
            onNodeDragStop={onDragStop}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onInit={setReactFlowInstance}
            style={{ background: "white" }}
            proOptions={{
              account: "paid-custom",
              hideAttribution: true
            }}
          >
            <Controls />
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
        </div>
        <DragabbleElements elements={draggableItems} />
      </div>
    </Page>
  );
};

export default TestCaseSequencer;
