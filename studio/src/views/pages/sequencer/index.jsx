import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import ReactFlow, { Controls, addEdge, useNodesState, useEdgesState, Background, MarkerType } from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import ConnectionLine from "./ConnectionLine";
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";

import TestCaseNode from "./TestCaseNode";
import StartNode from "./StartNode";
import DefaultEdge from "./DefaultEdge";
import DragabbleElements from "../common/DragabbleElements";
import PageHeader, { Page, PageActions, PageTitle } from "../common/PageHeader";
import { sequenceEvents, updateSequence } from "../../../redux/actions/TestSequencerActions";
import TimerNode from "./TimerNode";
import { fetchProject, startProjectBuilds } from "../../../redux/actions/ProjectActions";
import NodeTypes from "./NodeTypes";
import { nanoid } from "nanoid";
import TestScenarioNode from "./TestScenarioNode";
import IconButton from "../../utilities/IconButton";
import isEmpty from "lodash/isEmpty";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import DeleteNodeDialog from "./DeleteNodeDialog";
import UpdateNodeConfigDialog from "./UpdateNodeConfigDialog";
import Tooltip from "../../utilities/Tooltip";

const TestCaseSequencer = ({ project, windowDimension }) => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteEdgeDialog, setShowDeleteEdgeDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const { testcases, draggableItems, settings } = useSelector((state) => state.project);
  const { simulationData } = useSelector((state) => state.sequencer);
  const [nodes, setNodes, onNodesChange] = useNodesState(settings.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(settings.edges);

  const actionType = simulationData?.type;
  const eid = simulationData?.opts;

  useEffect(() => {
    if (project?.id) {
      fetchTestScenarios();
    }
  }, []);

  useEffect(() => {
    if (settings?.nodes?.length >= 0) {
      setNodes(settings.nodes);
    }
    if (settings?.edges?.length >= 0) {
      setEdges(settings.edges);
    }
  }, [testcases, draggableItems, settings]);

  const fetchTestScenarios = () => project?.id && dispatch(fetchProject(project.id));

  const handleDialogClose = useCallback(() => {
    setShowConfigDialog(false);
    setShowDeleteDialog(false);
    setShowDeleteEdgeDialog(false);
    dispatch(sequenceEvents("nodeAction:reset"));
  }, [dispatch]);

  const nodeTypes = useMemo(
    () => ({
      [NodeTypes.START_NODE]: StartNode,
      [NodeTypes.TESTCASE_NODE]: TestCaseNode,
      [NodeTypes.TESTSCENARIO_NODE]: TestScenarioNode,
      [NodeTypes.TIMER_NODE]: TimerNode
    }),
    []
  );

  const edgeTypes = useMemo(() => ({ default: DefaultEdge }), []);

  const saveTemplate = useCallback(
    (ns = [], es = []) => {
      const settings = isEmpty(ns) && isEmpty(es) ? null : { nodes: ns, edges: es };
      dispatch(updateSequence(project?.id, settings));
    },
    [project]
  );

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), [setSelectedNode]);
  const onNodeDoubleClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
      setShowConfigDialog(node.type === NodeTypes.TIMER_NODE);
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
        let id = ev.dataTransfer.getData("node-id");
        const type = ev.dataTransfer.getData("node-type");
        try {
          var data = JSON.parse(ev.dataTransfer.getData("node-value"));
        } catch (error) {
          error;
        }

        const reactFlowBounds = reactFlowWrapper?.current?.getBoundingClientRect();
        let clientX = isNaN(ev?.clientX) ? 300 : Number(ev?.clientX);
        let clientY = isNaN(ev?.clientX) ? 300 : Number(ev?.clientY);
        if (clientX < 0) clientX = 300;
        if (clientY < 0) clientY = 300;

        if (type == "TIMER") {
          id = nanoid(10);
        }
        const node = {
          id,
          type,
          data,
          position: reactFlowInstance.project({
            x: clientX - reactFlowBounds.left - 40,
            y: clientY - reactFlowBounds.top - 40
          })
        };

        const changes = [
          ...nodes,
          {
            ...node
          }
        ];
        setNodes(changes);
        saveTemplate(changes, edges);
      }
    },
    [edges, nodes, reactFlowInstance, saveTemplate, setNodes]
  );

  const onDragStop = useCallback(
    (_ev, node) => {
      if (node) {
        const i = nodes.findIndex((item) => item.id === node.id);
        if (i > -1) {
          nodes[i] = node;
          setNodes(nodes);
          saveTemplate(nodes, edges);
        }
      }
    },
    [edges, nodes, saveTemplate, setNodes]
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
      saveTemplate(nodes, changes);
    },
    [edges, setEdges]
  );

  useEffect(() => {
    switch (actionType) {
      case "nodeAction:editNode":
        setShowConfigDialog(true);
        break;
      case "nodeAction:deleteNode":
        setShowDeleteDialog(true);
        break;
      case "nodeAction:deleteEdge":
        setShowDeleteEdgeDialog(true);
        break;
      case "nodeAction:reset":
        setShowConfigDialog(false);
        setShowDeleteDialog(false);
        setShowDeleteEdgeDialog(false);
        dispatch(sequenceEvents("nodeAction:clear"));
        break;
      default:
    }
  }, [actionType]);

  const minHeight = windowDimension?.maxContentHeight - 45;

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
          saveTemplate(nodes, edges);
        }
      }
      handleDialogClose();
    },
    [edges, handleDialogClose, nodes, saveTemplate, selectedNode, setNodes]
  );

  const deleteNode = useCallback(() => {
    handleDialogClose();
    const changes = [...nodes];
    if (selectedNode) {
      const index = nodes.findIndex((node) => node.id === selectedNode.id);
      index > -1 && changes.splice(index, 1);
      const e = edges.filter((edge) => edge.source != selectedNode.id && edge.target != selectedNode.id);
      setNodes(changes);
      setEdges(e);
      saveTemplate(changes, e);
    }
  }, [edges, handleDialogClose, nodes, saveTemplate, selectedNode, setNodes]);

  const deleteEdge = useCallback(() => {
    if (eid) {
      const changes = [...edges];
      const index = changes.findIndex((e) => e.id === eid);
      changes.splice(index, 1);
      setEdges(changes);
      saveTemplate(nodes, changes);
    }
    handleDialogClose();
  }, [edges, eid, handleDialogClose, nodes, saveTemplate, setEdges]);

  const resetCanvas = () => {
    const ns = [
      {
        id: "start",
        type: NodeTypes.START_NODE,
        data: { label: "Start" },
        position: { x: 50, y: 300 }
      }
    ];
    setEdges([]);
    setNodes(ns);
    saveTemplate(ns, []);
  };

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Sequencer</PageTitle>
        <PageActions>
          <Tooltip title="Clear all nodes">
            <IconButton title="Reset" icon="ClearAll" onClick={resetCanvas} />
          </Tooltip>
          <Tooltip title="Start Automation Builds">
            <IconButton title="Trigger" icon="PlayArrowRounded" onClick={() => dispatch(startProjectBuilds(project?.id))} />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <div
        className="flex flex-row my-1 rounded border"
        style={{
          minHeight,
          maxHeight: minHeight
        }}
      >
        <div className="w-full reactflow-wrapper" ref={reactFlowWrapper}>
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
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onDragStop}
            onConnect={onConnect}
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
            {showDeleteDialog && selectedNode !== null && (
              <DeleteNodeDialog showDialog={showDeleteDialog} selectedNode={selectedNode} onClose={handleDialogClose} deleteNode={deleteNode} />
            )}
            <DeleteItemDialog
              showDialog={showDeleteEdgeDialog}
              title="Confirmation"
              question="Are you sure you want to delete this edge?"
              item={selectedNode?.id}
              onDelete={deleteEdge}
              onClose={handleDialogClose}
            />
            <Background color="#aaa" gap={15} />
          </ReactFlow>
        </div>
        <DragabbleElements elements={draggableItems} />
      </div>
    </Page>
  );
};

export default TestCaseSequencer;
