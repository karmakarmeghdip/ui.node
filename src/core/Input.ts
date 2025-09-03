import type { MouseEventProps, Window } from "skia-canvas";
import type { UINode } from "../elements/canvas";
import { signal } from "@preact/signals-core";

/**
 * A signal that holds the currently hovered UI node.
 * This is updated by the `handleEvents` function.
 */
export const currentHoveredNode = signal<{ node: UINode, e: MouseEventProps } | null>(null);

/**
 * Handles mouse events for the UI tree and performs basic hit-testing.
 * It traverses the UI tree to find the topmost node under the cursor and updates
 * the `clicked` and `hovered` signals accordingly.
 * @param e The mouse event object from `skia-canvas`.
 * @param root The root `UINode` of the UI tree to perform hit-testing on.
 */
export function handleEvents(
  e: {
    target: Window;
    type: "mouseup" | "mousedown" | "mousemove";
  } & MouseEventProps,
  root: UINode,
) {
  let currentNode = root;
  // Basic hit-testing: Traverse down the tree to find the most specific child
  while (true) {
    const child = currentNode.children.find((c) => {
      return (
        e.x >= (c.position?.x || 0) &&
        e.x <= (c.position?.x || 0) + c.yogaNode.getComputedWidth() &&
        e.y >= (c.position?.y || 0) &&
        e.y <= (c.position?.y || 0) + c.yogaNode.getComputedHeight()
      );
    });

    if (child) {
      currentNode = child;
    } else {
      // No more specific child found, this is the target node
      if (e.type === "mousedown") {
        currentNode.clicked.value = e;
      }
      if (e.type === "mouseup") {
        currentNode.clicked.value = null;
      }
      if (e.type === "mousemove" && currentHoveredNode.value?.node !== currentNode) {
        currentHoveredNode.value = { node: currentNode, e };
      }
      break;
    }
  }
}
