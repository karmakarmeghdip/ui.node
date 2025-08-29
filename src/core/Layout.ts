import Yoga from "yoga-layout";
import { paintNode, type UINode } from "../elements/canvas";
import { applyStyleToNode } from "../style/Style";

/**
 * Iteratively traverses the node tree in a depth-first manner and applies a callback to each node.
 * @param node The root UINode to start traversal from.
 * @param callback A function to apply to each node in the tree.
 */
export function iterateNodeTree(
  node: UINode,
  callback: (node: UINode) => void,
) {
  callback(node);
  const stack: UINode[] = [...node.children];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    callback(current);
    stack.push(...current.children);
  }
}

/**
 * Calculates the layout for a node and its children using the Yoga layout engine.
 * After calculating the layout, it traverses the tree to update node positions and trigger painting for nodes with new layouts.
 * This should be called whenever the layout needs to be recalculated, such as on window resize.
 * @param node The root UINode to layout.
 * @param width The width to constrain the layout to.
 * @param height The height to constrain the layout to.
 */
export function layoutNodeAndChildren(
  node: UINode,
  width?: number,
  height?: number,
) {
  if (
    node.yogaNode.getComputedWidth() !== width ||
    node.yogaNode.getComputedHeight() !== height
  ) {
    node.yogaNode.calculateLayout(width, height, Yoga.DIRECTION_LTR);
  }
  iterateNodeTree(node, (n) => {
    if (n.yogaNode.hasNewLayout()) {
      n.position = {
        x: (n.parent?.position?.x || 0) + n.yogaNode.getComputedLeft(),
        y: (n.parent?.position?.y || 0) + n.yogaNode.getComputedTop(),
      };
      console.log(
        `Node ${n.type} (id: ${n.id}) position: (${n.position.x}, ${n.position.y})`,
      );
      n.yogaNode.markLayoutSeen();
      paintNode(n);
    }
  });
}

/**
 * Sets up the initial layout for the UI tree and establishes reactive updates.
 * It performs an initial layout calculation and then subscribes to style changes on every node.
 * When a node's style signal changes, it re-applies the style and triggers a new layout calculation.
 * @param node The root UINode of the UI tree.
 * @param width The initial width of the layout.
 * @param height The initial height of the layout.
 */
export function setupLayout(node: UINode, width: number, height: number) {
  console.log("layout calc line 45");
  layoutNodeAndChildren(node, width, height);
  // Subscribe to style changes and relayout the node and its children
  iterateNodeTree(node, (n) => {
    // Style subscription should not cause cycles
    n.style.subscribe((s) => {
      console.log("layout calc line 51");
      applyStyleToNode(n.yogaNode, s);
      if (n.parent)
        layoutNodeAndChildren(
          n,
          n.parent.yogaNode.getComputedWidth(),
          n.parent.yogaNode.getComputedHeight(),
        );
      else layoutNodeAndChildren(n, width, height);
    });
  });
}
