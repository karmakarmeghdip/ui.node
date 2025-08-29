import { type Style } from "../../style/Style";
import { Element, type BaseElement } from "./Element";

export type Text = BaseElement & {
    type: "text";
    content: string;
};

export function Text(content: string, style: Style): Text {
    const text: Text = {
        ...Element(style),
        type: "text",
        content,
    };
    return text;
}