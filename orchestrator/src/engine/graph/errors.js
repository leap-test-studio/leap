/**
 * # NodeAlreadyExistsError
 *
 * This error is thrown when trying to create a node with the same identity as an existing node.
 *
 * @category Errors
 */

class NodeAlreadyExistsError extends Error {
  constructor(newNode, oldNode, identity) {
    super(`${JSON.stringify(newNode)} shares an identity (${identity}) with ${JSON.stringify(oldNode)}`);
    this.newNode = newNode;
    this.oldNode = oldNode;
    this.identity = identity;
    this.name = "NodeAlreadyExistsError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, NodeAlreadyExistsError.prototype);
  }
}

/**
 * # NodeDoesntExistError
 * This error is thrown when trying to access a node in a graph by it's identity when that node doesn't exist
 *
 * @category Errors
 */
class NodeDoesntExistError extends Error {
  constructor(identity) {
    super(`A node with identity ${identity} doesn't exist in the graph`);
    this.identity = identity;
    this.name = "NodeDoesntExistError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, NodeDoesntExistError.prototype);
  }
}

/**
 * # CycleError
 *
 * This error is thrown when attempting to create or update a Directed Acyclic Graph that contains a cycle.
 *
 * @category Errors
 */
class CycleError extends Error {
  constructor(message) {
    super(message);
    this.name = "CycleError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, CycleError.prototype);
  }
}

/**
 * # EmptyNodesExistError
 * This error is thrown when trying to access a node in a graph by it's identity when that node doesn't exist
 *
 * @category Errors
 */
class EmptyNodesExistError extends Error {
  constructor() {
    super("Nodes cannot be empty");
    this.name = "EmptyNodesExistError";

    // This bs is due to a limitation of Typescript: https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, EmptyNodesExistError.prototype);
  }
}
module.exports = {
  NodeAlreadyExistsError,
  NodeDoesntExistError,
  CycleError,
  EmptyNodesExistError
};
