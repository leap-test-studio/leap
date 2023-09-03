import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import ReactFlow, { Controls, addEdge, useNodesState, useEdgesState, Background, MarkerType } from "reactflow";
import ConnectionLine from "./ConnectionLine";
import TestCaseNode from "./TestCaseNode";
import { useDispatch, useSelector } from "react-redux";
import TestCaseStartNode from "./TestCaseStartNode";
import StartNode from "./StartNode";
import DefaultEdge from "./DefaultEdge";
import * as actionTypes from "../../../redux/actions";
import "reactflow/dist/style.css";
import "reactflow/dist/base.css";
import TestScenarioNode from "./TestScenarioNode";
import TestCaseEndNode from "./TestCaseEndNode";
import DragabbleElements from "../common/DragabbleElements";
import PageHeader, { Page, PageTitle } from "../common/PageHeader";
import { fetchTestScenarioList } from "../../../redux/actions/TestScenarioActions";

const TestCaseSequencer = ({ project, windowDimension }) => {
  const dispatch = useDispatch();
  const reactFlowWrapper = useRef();
  const { nodes: initialNodes, edges: initialEdges } = useSelector((state) => state.sequencer);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { testscenarios } = useSelector((state) => state.testscenario);

  const draggableItems = testscenarios?.map((t) => ({
    id: t.id,
    color: "#4D916E",
    icon: "Info",
    label: t.name,
    type: "element",
    value: t.id
  }));

  useEffect(() => {
    fetchTestScenarios();
  }, [project]);

  const fetchTestScenarios = () => project?.id && dispatch(fetchTestScenarioList(project.id));

  const nodeTypes = useMemo(() => {
    return { root: StartNode, tc: TestCaseNode, ts: TestScenarioNode, tss: TestCaseStartNode, tse: TestCaseEndNode };
  }, []);

  const edgeTypes = useMemo(() => ({ default: DefaultEdge }), []);

  const onDragStop = useCallback(
    (_ev, node) => {
      if (node) {
        const changes = [...nodes];
        let i = changes.findIndex((item) => item.id === node.id);
        if (i > -1) {
          changes[i].position = node.position;
          let minX = 10000,
            maxX = 0,
            minY = 10000,
            maxY = 0;
          let tssIndex = -1,
            tseIndex = -1;

          changes.forEach((n, index) => {
            if (n.parentNode === node.parentNode) {
              if (n.type === "tss") {
                tssIndex = index;
              } else if (n.type === "tse") {
                tseIndex = index;
              } else {
                if (n.position.x < minX) {
                  minX = n.position.x;
                }
                if (n.position.x > maxX) {
                  maxX = n.position.x;
                }
                if (n.position.y > maxY) {
                  maxY = n.position.y;
                }
                if (n.position.y < minY) {
                  minY = n.position.y;
                }
              }
            }
          });

          i = changes.findIndex((item) => item.id === node.parentNode);
          if (i > -1) {
            changes[i].style.width = maxX - minX + 250;
            changes[i].style.height = maxY - minY + 100;
            if (changes[i].position.x > changes[i].position.x + minX) {
              changes[i].position.x = changes[i].position.x + minX;
            }
            if (changes[i].position.y > changes[i].position.y + minY) {
              changes[i].position.y = changes[i].position.y + minY;
            }
            if (tssIndex > -1) {
              changes[tssIndex].position.y = changes[i].style.height / 2;
            }

            if (tseIndex > -1) {
              changes[tseIndex].position.y = changes[i].style.height / 2;
              changes[tseIndex].position.x = (tssIndex > -1 ? changes[tssIndex].position.x + changes[i].style.width : changes[i].style.width) - 50;
            }
          }
          setNodes(changes);
          dispatch({
            type: actionTypes.TEST_SEQUENCER,
            payload: {
              nodes: changes
            }
          });
        }
      }
    },
    [nodes, setNodes]
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
      dispatch({
        type: actionTypes.TEST_SEQUENCER,
        payload: {
          edges: changes
        }
      });
    },
    [edges, setEdges]
  );

  const minHeight = windowDimension?.maxContentHeight - 55;

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Sequencer</PageTitle>
      </PageHeader>
      <div className="flex flex-row mt-2 mb-1 rounded border bg-white" style={{ minHeight }}>
        <div className="w-full mr-2 reactflow-wrapper" ref={reactFlowWrapper} style={{ minHeight }}>
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
        <DragabbleElements title="Scenarios" elements={draggableItems} showIcon={true} showExpand={false} showFilter={true} />
      </div>
    </Page>
  );
};

export default TestCaseSequencer;
