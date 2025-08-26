import { signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import type { BaseElement } from "./Element";
import Yoga from "yoga-layout";

export type Text = BaseElement & {
    type: "text";
    content: string;
};

export function Text(content: string, style: Style): Text {
    const yogaNode = Yoga.Node.create();
    applyStyleToNode(yogaNode, style);
    const text: Text = {
        id: crypto.randomUUID(),
        type: "text",
        style: signal(style),
        yogaNode,
        repaint: signal(true),
        parent: null,
        children: [],
        content,
    };
    return text;
}