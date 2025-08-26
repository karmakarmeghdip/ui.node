import { signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import type { BaseElement } from "./Element";
import Yoga from "yoga-layout";

export type Image = BaseElement & {
    type: "image";
    src: string;
};

export function Image(src: string, style: Style): Image {
    const yogaNode = Yoga.Node.create();
    applyStyleToNode(yogaNode, style);
    const image: Image = {
        id: crypto.randomUUID(),
        type: "image",
        style: signal(style),
        yogaNode,
        repaint: signal(true),
        parent: null,
        children: [],
        src,
    };
    return image;
}