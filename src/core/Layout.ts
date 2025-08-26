import type { UINode } from "../elements";


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

