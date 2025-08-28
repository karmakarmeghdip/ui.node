import { signal, type Signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import { type Node } from "yoga-layout";
import Yoga from "yoga-layout";
import type { UINode } from ".";
import { paintBackround } from "../../style/Background";
import { paintBorder } from "../../style/Border";
import { enqueueDrawCommand } from "../../core/Renderer";

export type BaseElement = {
    id: string;
    style: Signal<Style>;
    yogaNode: Node;
    position?: { x: number, y: number };
    repaint: boolean;
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
        repaint: true,
        parent: null,
        children,
    };
    for (const child of children) {
        child.parent = element;
        element.yogaNode.insertChild(child.yogaNode, element.yogaNode.getChildCount());
    }
    return element;
}

export function paintElement(element: Element) {
    if (!element.repaint) return;
    const x = (element.position?.x ?? 0);
    const y = (element.position?.y ?? 0);
    enqueueDrawCommand((ctx) => paintBackround(ctx, x, y, element));
    enqueueDrawCommand((ctx) => paintBorder(ctx, x, y, element));
    element.repaint = false;
}