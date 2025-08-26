import type { Element } from "./canvas/Element";
import type { Image } from "./canvas/Image";
import type { Path } from "./canvas/Path";
import type { Text } from "./canvas/Text";

export type UINode = Text | Image | Path | Element;


export function addChild(parent: UINode, child: UINode) {
    parent.children.push(child);
    child.parent = parent;
    parent.yogaNode.insertChild(child.yogaNode, parent.yogaNode.getChildCount());
}

export function removeChild(parent: UINode, child: UINode) {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
        parent.children.splice(index, 1);
        child.parent = null;
        parent.yogaNode.removeChild(child.yogaNode);
        child.yogaNode.freeRecursive();
    }
}

export { Image } from "./canvas/Image";
export { Path } from "./canvas/Path";
export { Text } from "./canvas/Text";
export { Element } from "./canvas/Element";