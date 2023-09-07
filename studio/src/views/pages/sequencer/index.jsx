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
import { updateSequence } from "../../../redux/actions/TestSequencerActions";
import TimerNode from "./TimerNode";
import { fetchProject } from "../../../redux/actions/ProjectActions";
import NodeTypes from "./NodeTypes";
import { nanoid } from "nanoid";
import TestScenarioNode from "./TestScenarioNode";
import IconButton from "../../utilities/IconButton";

const TestCaseSequencer = ({ project, windowDimension }) => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const { testcases, testscenarios, draggableItems, settings } = useSelector((state) => state.project);
  const [nodes, setNodes, onNodesChange] = useNodesState(settings.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(settings.edges);

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
      dispatch(
        updateSequence(project?.id, {
          nodes: ns,
          edges: es
        })
      );
    },
    [project]
  );

  const onDragOver = useCallback((ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (ev) => {
      ev.preventDefault();
      if (reactFlowInstance) {
        const id = ev.dataTransfer.getData("node-id");
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

  const minHeight = windowDimension?.maxContentHeight - 45;

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Sequencer</PageTitle>
        <PageActions>
          <IconButton title="Reset" icon="ClearAll" onClick={saveTemplate} />
        </PageActions>
      </PageHeader>
      <div className="flex flex-row my-1 rounded border" style={{ minHeight }}>
        <div className="w-full reactflow-wrapper" ref={reactFlowWrapper} style={{ minHeight }}>
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
            <Background color="#aaa" gap={15} />
          </ReactFlow>
        </div>
        <DragabbleElements title="Drag and Drop" elements={draggableItems} width={130} />
      </div>
    </Page>
  );
};

export default TestCaseSequencer;
