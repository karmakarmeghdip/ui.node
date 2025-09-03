import { computed, signal, type Signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import { type Node } from "yoga-layout";
import Yoga from "yoga-layout";
import type { UINode } from ".";
import { paintBackground } from "../../style/Background";
import { paintBorder } from "../../style/Border";
import { enqueueDrawCommand } from "../../core/Renderer";
import { currentHoveredNode } from "../../core/Input";
import type { MouseEventProps } from "skia-canvas";

/**
 * Represents the base properties shared by all UI nodes in the tree.
 */
export type BaseElement = {
  /** A unique identifier for the node. */
  id: string;
  /** A signal holding the node's style properties. */
  style: Signal<Style>;
  /** The Yoga layout node associated with this UI node. */
  yogaNode: Node;
  /** The absolute screen position (x, y) of the node, calculated after layout. */
  position?: { x: number; y: number };
  /** A signal indicating if the node is currently being clicked. */
  clicked: Signal<MouseEventProps | null>;
  /** A computed signal that is true if the mouse is currently hovering over this node. */
  hovered: Signal<MouseEventProps | null>;
  /** A reference to the parent UI node, or null if it's the root. */
  parent: UINode | null;
  /** An array of child UI nodes. */
  children: UINode[];
};

export type Element = BaseElement & {
  /** The type discriminator for this node. */
  type: "element";
};

/**
 * Factory function to create a new Element container node.
 * Elements are basic containers that can hold child UI nodes and have style properties.
 * @param style The initial style properties for the element.
 * @param children Child UI nodes to be nested within this element.
 * @returns A new Element node.
 */
export function Element(style: Style, ...children: UINode[]): UINode {
  const yogaNode = Yoga.Node.create();
  applyStyleToNode(yogaNode, style);
  const element: Element = {
    id: crypto.randomUUID(),
    type: "element",
    style: signal(style),
    clicked: signal(null),
    hovered: computed(() => currentHoveredNode.value?.node.id === element.id ? currentHoveredNode.value.e : null),
    yogaNode,
    parent: null,
    children,
  };
  // Assign parent and insert children into Yoga node
  for (const child of children) {
    child.parent = element;
    element.yogaNode.insertChild(
      child.yogaNode,
      element.yogaNode.getChildCount(),
    );
  }
  return element;
}

/**
 * Enqueues draw commands to render an Element node.
 * This includes drawing the background color and borders.
 * @param element The Element node to paint.
 */
export function paintElement(element: Element) {
  const x = element.position?.x ?? 0;
  const y = element.position?.y ?? 0;
  enqueueDrawCommand((ctx) => paintBackground(ctx, x, y, element));
  enqueueDrawCommand((ctx) => paintBorder(ctx, x, y, element));
}
