const BPromise = require("bluebird");

const root = {
  id: 1,
  name: "Start Node",
  type: "SN",
  children: [
    {
      id: 2,
      name: "TCID0001",
      type: "TC",
      children: [
        {
          id: 3,
          name: "Timer",
          type: "TIMER",
          children: [
            {
              id: 4,
              name: "TCID0002",
              type: "TC",
              children: [
                {
                  id: 7,
                  name: "TCID0005",
                  type: "TC",
                  children: []
                }
              ]
            },
            {
              id: 5,
              name: "TCID0003",
              type: "TC",
              children: [
                {
                  id: 7,
                  name: "TCID0005",
                  type: "TC",
                  children: []
                }
              ]
            },
            {
              id: 6,
              name: "TCID0004",
              type: "TC",
              children: [
                {
                  id: 7,
                  name: "TCID0005",
                  type: "TC",
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

function AyncFunc(message) {
  return new Promise((resolve) => {
    let ran = getRandomizer(100, 3000);
    console.log("S", message.id, message.name, Date.now());
    setTimeout(() => {
      resolve(message);
    }, ran);
  });
}

function getRandomizer(bottom, top) {
  return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
}

async function Runner(root) {
  if (root == null || root.children == null || root.children.length == 0) return Promise.resolve();
  const result = await BPromise.map(root.children, AyncFunc, { concurrency: 10 });
  const nextElements = {};
  result?.forEach((o) => {
    const element = root.children.find((c) => c.id === o.id);
    element.children?.forEach((c) => {
      nextElements[c.id] = c;
    });
  });
  return Runner({ children: Object.values(nextElements) });
}

function main() {
  const flow = {
    edges: [
      {
        id: "reactflow__edge-startstart-node-d8cffd05-0d75-49de-9c43-3e2a0dca9138target:TC",
        type: "default",
        source: "start",
        target: "d8cffd05-0d75-49de-9c43-3e2a0dca9138",
        animated: true,
        sourceHandle: "start-node",
        targetHandle: "target:TC"
      },
      {
        id: "reactflow__edge-d8cffd05-0d75-49de-9c43-3e2a0dca9138source:TC-44Zv772s83target:44Zv772s83",
        type: "default",
        source: "d8cffd05-0d75-49de-9c43-3e2a0dca9138",
        target: "44Zv772s83",
        animated: true,
        sourceHandle: "source:TC",
        targetHandle: "target:44Zv772s83"
      },
      {
        id: "reactflow__edge-44Zv772s83source:44Zv772s83-a0dbecf7-988f-4d30-9b29-2af2e575507btarget:TC",
        type: "default",
        source: "44Zv772s83",
        target: "a0dbecf7-988f-4d30-9b29-2af2e575507b",
        animated: true,
        sourceHandle: "source:44Zv772s83",
        targetHandle: "target:TC"
      }
    ],
    nodes: [
      {
        id: "start",
        type: "SN",
        width: 70,
        height: 70
      },
      {
        id: "d8cffd05-0d75-49de-9c43-3e2a0dca9138",
        type: "TC",
        width: 96,
        height: 105,
        dragging: true,
        selected: false
      },
      {
        id: "a0dbecf7-988f-4d30-9b29-2af2e575507b",
        type: "TC",
        width: 96,
        height: 105,
        dragging: true,
        selected: true
      },
      {
        id: "44Zv772s83",
        type: "TIMER",
        width: 96,
        height: 112,
        dragging: true,
        selected: false
      }
    ]
  };

  function findNextElements(id) {
    const startNode = flow.nodes.find((n) => n.id === id);
    const node = {
      id: startNode.id,
      type: startNode.type,
      children: []
    };
    const targets = flow.edges.filter((e) => e.source == startNode.id);
    targets.forEach((t) => {
      node.children.push(findNextElements(t.target));
    });
    return node;
  }
  Runner(findNextElements("start"));
}

main();
