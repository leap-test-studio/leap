const BPromise = require("bluebird");
const fs = require("fs");

function AyncFunc(message) {
  return new Promise((resolve) => {
    let ran = getRandomizer(100, 1000);
    setTimeout(() => {
      console.log(message.id, message.type);
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
  console.log();
  return Runner({ children: Object.values(nextElements) });
}

function main() {
  const se = require("./settings.json");
  const flow = se.settings;

  function findNextElements(id) {
    const startNode = flow.nodes.find((n) => n.id === id);
    if (!startNode) return null;
    const node = {
      id: startNode.id,
      type: startNode.type,
      children: []
    };
    const targets = flow.edges.filter((e) => e.source == startNode.id);
    targets.forEach((t) => {
      const child = findNextElements(t.target);
      if (child != null) {
        node.children.push(child);
      }
    });
    return node;
  }
  const eles = findNextElements("start")
  Runner(eles);
  fs.writeFileSync("flow.json", JSON.stringify(eles, null, 2))
}

main();
