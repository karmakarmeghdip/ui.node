import type { UINode } from "../elements/canvas";

/**
 * Recursively prints the UI tree structure to the console.
 * This is a utility function for debugging the tree hierarchy.
 * @param node The root `UINode` to start printing from.
 * @param depth The current depth of the recursion, used for indentation.
 */
export function printTree(node: UINode, depth = 0) {
  console.log(`${"  ".repeat(depth)}- ${node.type} (id: ${node.id})`);
  for (const child of node.children) {
    printTree(child, depth + 1);
  }
}
