import { Element, type BaseElement } from "./Element";
import { type Style } from "../../style/Style";

export type Path = BaseElement & {
    type: "path";
    d: string;
};

export function Path(d: string, style: Style): Path {

    const path: Path = {
        ...Element(style),
        type: "path",
        d,
    };
    return path;
}