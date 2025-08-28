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
export function layoutNodeAndChildren(node: UINode, width?: number, height?: number) {
    if (node.yogaNode.getComputedWidth() !== width || node.yogaNode.getComputedHeight() !== height) {
        node.yogaNode.calculateLayout(width, height, Yoga.DIRECTION_LTR);
    }
    iterateNodeTree(node, (n) => {
        if (n.yogaNode.hasNewLayout()) {
            n.position = {
                x: n.parent?.position?.x || 0 + n.yogaNode.getComputedLeft(),
                y: n.parent?.position?.y || 0 + n.yogaNode.getComputedTop(),
            };
            n.repaint = true; // Mark node for repaint
            console.log(`Node ${n.type} (id: ${n.id}) position: (${n.position.x}, ${n.position.y})`);
            n.yogaNode.markLayoutSeen();
            paintNode(n);
        }
    });

}

// Call at setup
export function setupLayout(node: UINode, width: number, height: number) {
    console.log("layout calc line 45");
    layoutNodeAndChildren(node, width, height);
    // Subscribe to style changes and relayout the node and its children
    iterateNodeTree(node, (n) => {
        // Style subscription should not cause cycles
        n.style.subscribe(() => {
            console.log("layout calc line 51");
            if (n.parent)
                layoutNodeAndChildren(n, n.parent.yogaNode.getComputedWidth(), n.parent.yogaNode.getComputedHeight());
            else
                layoutNodeAndChildren(n, width, height);
        });
    });
}