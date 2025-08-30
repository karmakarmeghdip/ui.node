import { iterateNodeTree } from "../../core/Layout";
import { paintElement, type Element } from "./Element";
import type { Image } from "./Image";
import type { Path } from "./Path";
import { paintText, type Text } from "./Text";

/**
 * A union type representing all possible node types in the UI tree.
 */
export type UINode = Text | Image | Path | Element;

/**
 * Adds a child node to a parent node and updates the layout tree.
 * After adding, it triggers a repaint of the parent's entire subtree.
 * @param parent The parent UINode to add the child to.
 * @param child The child UINode to add.
 */
export function addChild(parent: UINode, child: UINode) {
  parent.children.push(child);
  child.parent = parent;
  parent.yogaNode.insertChild(child.yogaNode, parent.yogaNode.getChildCount());
  // TODO: This repaints the entire tree, could be optimized
  iterateNodeTree(parent, (n) => {
    paintNode(n);
  });
}

/**
 * Removes a child node from a parent node and cleans up resources.
 * It removes the child from the parent's children array, disconnects the layout nodes,
 * and frees the Yoga node and its children recursively.
 * After removing, it triggers a repaint of the parent's entire subtree.
 * @param parent The parent UINode to remove the child from.
 * @param child The child UINode to remove.
 */
export function removeChild(parent: UINode, child: UINode) {
  const index = parent.children.indexOf(child);
  if (index !== -1) {
    parent.children.splice(index, 1);
    child.parent = null;
    parent.yogaNode.removeChild(child.yogaNode);
    child.yogaNode.freeRecursive();
    // TODO: This repaints the entire tree, could be optimized
    iterateNodeTree(parent, (n) => {
      paintNode(n);
    });
  }
}

/**
 * Acts as a dispatcher for painting different types of UI nodes.
 * It calls the appropriate paint function based on the node's `type` property.
 * @param node The UINode to paint.
 */
export function paintNode(node: UINode) {
  console.log(`Painting node ${node.type} (id: ${node.id})`);
  switch (node.type) {
    case "element":
      paintElement(node);
      break;
    case "text":
      paintText(node);
      break;
    // TODO: Implement paint functions for other element types
    default:
      console.warn(`Unknown node type: ${node.type}, ignoring paint request.`);
  }
}

// Export factory functions and types for easy access
export { Image } from "./Image";
export { Path } from "./Path";
export { Text } from "./Text";
export { Element } from "./Element";
