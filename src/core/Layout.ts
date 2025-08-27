import Yoga from "yoga-layout";
import { paintNode, type UINode } from "../elements/canvas";


/**
 * Iteratively traverses the node tree and applies the callback to each node.
 * @param node The root UINode to start traversal from.
 * @param callback A function to apply to each node in the tree.
 */
export function iterateNodeTree(node: UINode, callback: (node: UINode) => void) {
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
 * Layouts the node and its children using Yoga layout engine.
 * Call this function whenever the layout needs to be recalculated like resize or orientation change.
 * @param node The root UINode to layout.
 * @param width The width to layout the node.
 * @param height The height to layout the node.
 */
export function layoutNodeAndChildren(node: UINode, width: number, height: number) {
    node.yogaNode.calculateLayout(width, height, Yoga.DIRECTION_LTR);
    iterateNodeTree(node, (n) => {
        if (n.yogaNode.hasNewLayout()) {
            n.position = {
                x: n.parent?.position?.x || 0 + n.yogaNode.getComputedLeft(),
                y: n.parent?.position?.y || 0 + n.yogaNode.getComputedTop(),
            };
            console.log(`Node ${n.type} (id: ${n.id}) position: (${n.position.x}, ${n.position.y})`);
        }
    });
    if (!node.repaint.value)
        node.repaint.value = true; // Mark node for repaint
}

// Call at setup
export function setupLayout(node: UINode, width: number, height: number) {
    console.log("Initial layout setup");
    layoutNodeAndChildren(node, width, height);
    // Subscribe to style changes and relayout the node and its children
    iterateNodeTree(node, (n) => {
        // Style subscription should not cause cycles
        n.style.subscribe(() => {
            layoutNodeAndChildren(node, width, height);
        });
        // Repaint subscription - only handle painting, avoid relayout cycles
        n.repaint.subscribe(() => {
            // Paint the element if it needs repainting
            if (n.repaint.value) {
                paintNode(n);
                n.repaint.value = false;
                // Mark children for repaint
                for (const child of n.children) {
                    child.repaint.value = true;
                }
            }
        });
    });
    node.repaint.value = true;
}