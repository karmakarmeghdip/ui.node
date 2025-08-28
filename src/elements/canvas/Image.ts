import { signal } from "@preact/signals-core";
import { applyStyleToNode, type Style } from "../../style/Style";
import { Element, type BaseElement } from "./Element";
import Yoga from "yoga-layout";

export type Image = BaseElement & {
    type: "image";
    src: string;
};

export function Image(src: string, style: Style): Image {
    const yogaNode = Yoga.Node.create();
    applyStyleToNode(yogaNode, style);
    const image: Image = {
        ...Element(style),
        type: "image",
        src,
    };
    return image;
}