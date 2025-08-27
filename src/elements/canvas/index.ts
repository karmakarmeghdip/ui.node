import { paintElement, type Element } from "./Element";
import type { Image } from "./Image";
import type { Path } from "./Path";
import type { Text } from "./Text";

export type UINode = Text | Image | Path | Element;


export function addChild(parent: UINode, child: UINode) {
    parent.children.push(child);
    child.parent = parent;
    parent.yogaNode.insertChild(child.yogaNode, parent.yogaNode.getChildCount());
    parent.repaint.value = true;
}

export function removeChild(parent: UINode, child: UINode) {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
        parent.children.splice(index, 1);
        child.parent = null;
        parent.yogaNode.removeChild(child.yogaNode);
        child.yogaNode.freeRecursive();
        parent.repaint.value = true;
    }
}

export function paintNode(node: UINode) {
    switch (node.type) {
        case "element":
            paintElement(node);
            break;
        default:
            console.warn(`Unknown node type: ${node.type}, ignoring paint request.`);
    }
}

export { Image } from "./Image";
export { Path } from "./Path";
export { Text } from "./Text";
export { Element } from "./Element";