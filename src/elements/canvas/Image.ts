import { type Style } from "../../style/Style";
import { Element, type BaseElement } from "./Element";

export type Image = BaseElement & {
    type: "image";
    src: string;
};

export function Image(src: string, style: Style): Image {
    const image: Image = {
        ...Element(style),
        type: "image",
        src,
    };
    return image;
}