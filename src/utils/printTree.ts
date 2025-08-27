import type { UINode } from "../elements/canvas";

export function printTree(node: UINode, depth = 0) {
    console.log(`${"  ".repeat(depth)}- ${node.type} (id: ${node.id})`);
    for (const child of node.children) {
        printTree(child, depth + 1);
    }
}