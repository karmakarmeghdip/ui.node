import type { MouseEventProps, Window } from "skia-canvas";
import type { UINode } from "../elements/canvas";
import { computed, signal } from "@preact/signals-core";
import { iterateNodeTree } from "./Layout";

export const currentHoveredNode = signal<UINode | null>(null);

export function handleEvents(e: {
    target: Window;
    type: "mouseup" | "mousedown" | "mousemove";
} & MouseEventProps, root: UINode) {
    let currentNode = root;
    while (true) {
        const child = currentNode.children.find(c => {
            return e.x >= (c.position?.x || 0) && e.x <= (c.position?.x || 0) + c.yogaNode.getComputedWidth() &&
                e.y >= (c.position?.y || 0) && e.y <= (c.position?.y || 0) + c.yogaNode.getComputedHeight();
        });
        if (child) {
            currentNode = child;
        } else {
            if (e.type === "mousedown")
                currentNode.clicked.value = true;
            if (e.type === "mouseup")
                currentNode.clicked.value = false;
            if (e.type === "mousemove" && currentHoveredNode.value !== currentNode)
                currentHoveredNode.value = currentNode;
            break;
        }
    }
}