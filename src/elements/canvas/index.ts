import { iterateNodeTree } from "../../core/Layout";
import { paintElement, type Element } from "./Element";
import type { Image } from "./Image";
import type { Path } from "./Path";
import type { Text } from "./Text";

export type UINode = Text | Image | Path | Element;


export function addChild(parent: UINode, child: UINode) {
    parent.children.push(child);
    child.parent = parent;
    parent.yogaNode.insertChild(child.yogaNode, parent.yogaNode.getChildCount());
    iterateNodeTree(parent, n => {
        paintNode(n);
    })
}

export function removeChild(parent: UINode, child: UINode) {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
        parent.children.splice(index, 1);
        child.parent = null;
        parent.yogaNode.removeChild(child.yogaNode);
        child.yogaNode.freeRecursive();
        iterateNodeTree(parent, n => {
            paintNode(n);
        });
    }
}

export function paintNode(node: UINode) {
    console.log(`Painting node ${node.type} (id: ${node.id})`);
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