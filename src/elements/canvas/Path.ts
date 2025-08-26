import { signal } from "@preact/signals-core";
import type { BaseElement } from "./Element";
import { applyStyleToNode, type Style } from "../../style/Style";
import Yoga from "yoga-layout";

export type Path = BaseElement & {
    type: "path";
    d: string;
};

export function Path(d: string, style: Style): Path {
    const yogaNode = Yoga.Node.create();
    applyStyleToNode(yogaNode, style);
    const path: Path = {
        id: crypto.randomUUID(),
        type: "path",
        style: signal(style),
        yogaNode,
        repaint: signal(true),
        parent: null,
        children: [],
        d,
    };
    return path;
}