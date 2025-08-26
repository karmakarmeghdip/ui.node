import { signal, type Signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import type { Node } from "yoga-layout";
import Yoga from "yoga-layout";
import type { UINode } from "..";

export type BaseElement = {
    id: string;
    style: Signal<Style>;
    yogaNode: Node;
    repaint: Signal<boolean>;
    parent: UINode | null;
    children: UINode[];
};

export type Element = BaseElement & {
    type: "element";
};

export function Element(style: Style, ...children: UINode[]): UINode {
    const yogaNode = Yoga.Node.create();
    applyStyleToNode(yogaNode, style);
    const element: Element = {
        id: crypto.randomUUID(),
        type: "element",
        style: signal(style),
        yogaNode,
        repaint: signal(true),
        parent: null,
        children,
    };
    for (const child of children) {
        child.parent = element;
        element.yogaNode.insertChild(child.yogaNode, element.yogaNode.getChildCount());
    }
    return element;
}